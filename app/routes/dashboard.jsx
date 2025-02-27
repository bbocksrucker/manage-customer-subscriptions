import { useEffect, useState } from "react";
import { Box, Text, Card, Layout, Page, Spinner } from "@shopify/polaris";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { DatePicker } from "@shopify/polaris";
import { AppProvider } from "@shopify/polaris"; 
import { createClient } from "@supabase/supabase-js";
import '@shopify/polaris/build/esm/styles.css';


// ⬇️ Supabase-Client außerhalb der Komponente erstellen, um unnötige Neuinitialisierungen zu vermeiden
const supabase = createClient(
    "https://ytgrqowmsrgrcjrpzgum.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk1MzU2NywiZXhwIjoyMDQ5NTI5NTY3fQ.BqOjaxSMNj8oftOeOeASDW9YEj-Ff_fNC8Fp8pI-39s"
);

export default function Dashboard() {
    const [isClient, setIsClient] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingNewCustomers, setLoadingNewCustomers] = useState(true);
    const [loadingCanceledCustomers, setLoadingCanceledCustomers] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, paused: 0 });
    const [newCustomers, setNewCustomers] = useState(0);
    const [canceledCustomers, setCanceledCustomers] = useState(0);
    const [loadingGraph, setLoadingGraph] = useState(true);
    const [graphData, setGraphData] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),});
    const [selectedDates, setSelectedDates] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),});
    const handleDateChange = (newRange) => {
    if (newRange?.start && newRange?.end) {
        setSelectedDateRange({ start: newRange.start, end: newRange.end });
        setSelectedDates({ start: newRange.start, end: newRange.end });
    }};
    const [{ month, year }, setDatePicker] = useState({
        month: selectedDates.start.getMonth(),
        year: selectedDates.start.getFullYear(),
    });
    const [pendingDateRange, setPendingDateRange] = useState(null); // Temporäre Speicherung

    

    useEffect(() => {
        setIsClient(true);
    }, []);

    // ✅ Fetch für Stats
    useEffect(() => {
        async function fetchStats() {
            setLoadingStats(true);
            let allData = [];
            let from = 0;
            const batchSize = 1000;
            let moreData = true;

            while (moreData) {
                const { data, error } = await supabase
                    .from("contracts")
                    .select("status")
                    .range(from, from + batchSize - 1);

                if (error) {
                    console.error("Fehler beim Laden der Daten:", error);
                    setLoadingStats(false);
                    return;
                }

                if (data.length < batchSize) {
                    moreData = false;
                }

                allData = [...allData, ...data];
                from += batchSize;
            }

            setStats({
                total: allData.length,
                active: allData.filter((c) => c.status === "active").length,
                paused: allData.filter((c) => c.status === "paused").length,
            });

            setLoadingStats(false);
        }

        fetchStats();
    }, []); // ✅ `fetchStats()` wird nur EINMAL aufgerufen

    // ✅ Fetch für Neukunden im Zeitraum
    useEffect(() => {
        async function fetchNewCustomers() {
            setLoadingNewCustomers(true);
            let allData = [];
            let from = 0;
            const batchSize = 1000;
            let moreData = true;
    
            while (moreData) {
                const { data, error } = await supabase
                    .from("contracts")
                    .select("activation_date")
                    .range(from, from + batchSize - 1);
    
                if (error) {
                    console.error("❌ Fehler beim Laden der Neukunden:", error);
                    setLoadingNewCustomers(false);
                    return;
                }
    
                if (!data || data.length === 0) {
                    console.warn("⚠️ Keine Daten für Neukunden gefunden!");
                    setLoadingNewCustomers(false);
                    return;
                }
    
                if (data.length < batchSize) {
                    moreData = false; // Falls weniger als 1000 Einträge, sind wir fertig
                }
    
                allData = [...allData, ...data]; // Daten an Liste anhängen
                from += batchSize; // Nächste 1000 abrufen
            }
    
            console.log(`✔️ Geladene Neukunden-Einträge: ${allData.length}`);
    
            // 📆 Zeitraum-Daten als reine "YYYY-MM-DD" Strings formatieren
            const fromDate = selectedDateRange.start.toISOString().split("T")[0]; 
            const toDate = selectedDateRange.end.toISOString().split("T")[0];

    
            console.log(`📆 Zeitraum: ${fromDate} - ${toDate}`);
    
            const newCustomersCount = allData.filter(({ activation_date }) => {
                if (!activation_date) return false; // Falls `activation_date` leer oder null ist
                
                return activation_date >= fromDate && activation_date <= toDate; 
            }).length;
    
            console.log(`🎯 Neukunden im Zeitraum: ${newCustomersCount}`);
            
            setNewCustomers(newCustomersCount);
            setLoadingNewCustomers(false);
        }
    
        if (selectedDateRange.start && selectedDateRange.end) {
            fetchNewCustomers();
        }
    }, [selectedDateRange]);

    // ✅ Fetch für Neukunden im Zeitraum
    useEffect(() => {
        async function fetchCanceledCustomers() {
            setLoadingCanceledCustomers(true);
            let allData = [];
            let from = 0;
            const batchSize = 1000;
            let moreData = true;
    
            while (moreData) {
                const { data, error } = await supabase
                    .from("contracts")
                    .select("cancelation_date")
                    .range(from, from + batchSize - 1);
    
                if (error) {
                    console.error("❌ Fehler beim Laden der Neukunden:", error);
                    setLoadingCanceledCustomers(false);
                    return;
                }
    
                if (!data || data.length === 0) {
                    console.warn("⚠️ Keine Daten für Neukunden gefunden!");
                    setLoadingCanceledCustomers(false);
                    return;
                }
    
                if (data.length < batchSize) {
                    moreData = false; // Falls weniger als 1000 Einträge, sind wir fertig
                }
    
                allData = [...allData, ...data]; // Daten an Liste anhängen
                from += batchSize; // Nächste 1000 abrufen
            }
    
            console.log(`✔️ Geladene Kündigungen-Einträge: ${allData.length}`);
    
            // 📆 Zeitraum-Daten als reine "YYYY-MM-DD" Strings formatieren
            const fromDate = selectedDateRange.start.toISOString().split("T")[0]; 
            const toDate = selectedDateRange.end.toISOString().split("T")[0];

    
            console.log(`📆 Zeitraum: ${fromDate} - ${toDate}`);
    
            const canceledCustomersCount = allData.filter(({ cancelation_date }) => {
                if (!cancelation_date) return false; // Falls `activation_date` leer oder null ist
                
                return cancelation_date >= fromDate && cancelation_date <= toDate; 
            }).length;
    
            console.log(`🎯 Kündigungen im Zeitraum: ${canceledCustomersCount}`);
            
            setCanceledCustomers(canceledCustomersCount);
            setLoadingCanceledCustomers(false);
        }
    
        if (selectedDateRange.start && selectedDateRange.end) {
            fetchCanceledCustomers();
        }
    }, [selectedDateRange]);

    useEffect(() => {
        async function fetchGraphData() {
            setLoadingGraph(true);
            let allData = [];
            let from = 0;
            const batchSize = 1000;
            let moreData = true;
    
            while (moreData) {
                const { data, error } = await supabase
                    .from("contracts")
                    .select("activation_date, cancelation_date")
                    .range(from, from + batchSize - 1);
    
                if (error) {
                    console.error("❌ Fehler beim Laden der Graph-Daten:", error);
                    setLoadingGraph(false);
                    return;
                }
    
                if (!data || data.length === 0) {
                    console.warn("⚠️ Keine Daten für den Graphen gefunden!");
                    setLoadingGraph(false);
                    return;
                }
    
                if (data.length < batchSize) {
                    moreData = false;
                }
    
                allData = [...allData, ...data]; // Daten an Liste anhängen
                from += batchSize;
            }
    
            console.log(`✔️ Geladene Einträge für den Graphen: ${allData.length}`);
    
            // 📆 Zeitraum-Daten als reine "YYYY-MM-DD" Strings formatieren
            const fromDate = selectedDateRange.start.toISOString().split("T")[0];
            const toDate = selectedDateRange.end.toISOString().split("T")[0];
    
            console.log(`📆 Zeitraum für den Graphen: ${fromDate} - ${toDate}`);
    
            // 🟢 1. Initiale Struktur für den Zeitraum erstellen
            let dailyStats = {};
    
            let dateCursor = new Date(selectedDateRange.start);
            while (dateCursor <= selectedDateRange.end) {
                const dateString = dateCursor.toISOString().split("T")[0];
                dailyStats[dateString] = { date: dateString, newCustomers: 0, canceledCustomers: 0 };
                dateCursor.setDate(dateCursor.getDate() + 1);
            }
    
            // 🟢 2. Daten den jeweiligen Tagen zuweisen
            allData.forEach(({ activation_date, cancelation_date }) => {
                if (activation_date && activation_date >= fromDate && activation_date <= toDate) {
                    const formattedDate = activation_date.split("T")[0];
                    if (dailyStats[formattedDate]) dailyStats[formattedDate].newCustomers++;
                }
                if (cancelation_date && cancelation_date >= fromDate && cancelation_date <= toDate) {
                    const formattedDate = cancelation_date.split("T")[0];
                    if (dailyStats[formattedDate]) dailyStats[formattedDate].canceledCustomers++;
                }
            });
    
            // 🟢 3. Werte für den Graphen speichern
            setGraphData(Object.values(dailyStats));
            setLoadingGraph(false);
        }
    
        if (selectedDateRange.start && selectedDateRange.end) {
            fetchGraphData();
        }
    }, [selectedDateRange]);
    

    if (!isClient) return null;

    return (
        <AppProvider i18n={{}}>
            <Page title="afreshed® Dashboard" subtitle="Contract Statistik">
                <Layout>
                    {(loadingStats || loadingNewCustomers || loadingCanceledCustomers) ? (
                        <Layout.Section>
                            <Spinner accessibilityLabel="Laden..." size="large" />
                        </Layout.Section>
                    ) : (
                        <>
                        <Layout>
                            <Layout.Section oneThird>
                                <Box background="surface" padding="400" border="base" borderRadius="300" shadow="300">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Gesamtanzahl Abonnements
                                    </Text>
                                    <Text variant="heading2xl" fontWeight="medium">{stats.total}</Text>
                                </Box>
                            </Layout.Section>
                            <Layout.Section oneThird>
                                <Box background="bg-fill-success" padding="400" border="base" borderRadius="300" shadow="100">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Aktive Abonnements
                                    </Text>
                                    <Text variant="heading2xl" fontWeight="medium">{stats.active}</Text>
                                </Box>
                            </Layout.Section>
                            <Layout.Section oneThird>
                                <Box background="bg-fill-warning" padding="400" border="base" borderRadius="300" shadow="100">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Pausierte Abonnements
                                    </Text>
                                    <Text variant="heading2xl" fontWeight="medium">{stats.paused}</Text>
                                </Box>
                            </Layout.Section>

                            <Layout.Section>
                                <Box background="bg-surface" padding="400" border="base" borderRadius="300" shadow="300">
                                    <DatePicker
                                        month={month}
                                        year={year}
                                        onChange={handleDateChange}
                                        onMonthChange={(newMonth, newYear) => setDatePicker({ month: newMonth, year: newYear })}
                                        selected={selectedDates} // 🛠️ Einheitliches Format für `selectedDates`
                                        allowRange
                                    />
                                </Box>
                            </Layout.Section>
                            <Layout.Section oneThird>
                                <Box background="bg-fill-highlight-subdued" padding="400" border="base" borderRadius="300" shadow="300">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Neue Abonnements im Zeitraum
                                    </Text>
                                    <Text variant="heading2xl" fontWeight="medium">{newCustomers}</Text>
                                </Box>
                            </Layout.Section>
                            <Layout.Section oneThird>
                                <Box background="bg-fill-highlight-subdued" padding="400" border="base" borderRadius="300" shadow="300">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Gekündigte Abonnements im Zeitraum
                                    </Text>
                                    <Text variant="heading2xl" fontWeight="medium">{canceledCustomers}</Text>
                                </Box>
                            </Layout.Section>
                            <Layout.Section>
                                <Box background="bg-surface" padding="400" border="base" borderRadius="300" shadow="300">
                                    <Text as="h2" variant="headingMd" fontWeight="bold">
                                        Neukunden vs. Stornierte Abos
                                    </Text>
                                    {loadingGraph ? (
                                        <Spinner accessibilityLabel="Laden..." size="large" />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={graphData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="newCustomers" stroke="#82ca9d" name="Neukunden" />
                                                <Line type="monotone" dataKey="canceledCustomers" stroke="#ff6666" name="Stornierte Abos" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Layout.Section>
                        </Layout>

                        </>
                    )}
                </Layout>
            </Page>
        </AppProvider>
    );
}


import React, { useState, useEffect } from "react";
import { Select, Button, TextField } from "@shopify/ui-extensions/admin";
import {
  render,
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  DatePicker,
  InlineStack,
} from "@shopify/ui-extensions-react/admin";

const TARGET = "admin.customer-details.block.render";

function App() {
  const [status, setStatus] = useState("");
  const [interval, setInterval] = useState("");
  const [pauseStart, setPauseStart] = useState("");
  const [pauseEnd, setPauseEnd] = useState("");
  const [collections, setCollections] = useState([]);
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [cutouts, setCutouts] = useState([]);
  const [cutoutOptions, setCutoutOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [contractData, setContractData] = useState("");
  const [selected, setSelected] = useState({ start: null, end: null });
  const { i18n, data } = useApi(TARGET);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [valueondropdown, setValueOnDropdown] = useState("");
  const [valueondropdownCutout, setValueOnDropdownCutout] = useState("");


  useEffect(() => {
    setValueOnDropdown("");
  }, [valueondropdown]);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const ensureArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value);
    }
    if (value) {
      return [value];
    }
    return [];
  };

  function extractCustomerId(shopifyId) {
    if (!shopifyId) return null;
    const parts = shopifyId.split("/");
    return parts[parts.length - 1];
  }

  async function fetchContractData() {
    if (!data || !data.selected || !Array.isArray(data.selected) || data.selected.length === 0) {
      setLoading(false);
      return;
    }

    const rawCustomerId = data.selected[0]?.id;
    if (!rawCustomerId) {
      setLoading(false);
      return;
    }
    const customerId = extractCustomerId(rawCustomerId);

    if (!customerId) {
      console.error("Ungültige Customer ID:", rawCustomerId);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://ytgrqowmsrgrcjrpzgum.supabase.co/functions/v1/get_contracts`,
        {
          method: "POST", // 🚨 WICHTIG: Die Function erwartet eine POST-Anfrage
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg",  // 👈 Supabase ANON-KEY
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg"
          },
          body: JSON.stringify({ customer_id: customerId }), // JSON-Body mit Customer ID
        }
      );
    
      const contractData = await response.json();
    
      if (contractData.success && contractData.data.length > 0) {
        const contract = contractData.data[0];
        setContractData(contract);
        setStatus(contract.status || "");
        setInterval(contract.interval || "");
        setPauseStart(contract.pause_start || "");
        setPauseEnd(contract.pause_end || "");
        setCollections(ensureArray(contract.collection_id));
        setCutouts(ensureArray(contract.cut_outs));
        setSelected({
          start: contract.pause_start ? new Date(contract.pause_start) : null,
          end: contract.pause_end ? new Date(contract.pause_end) : null,
        });
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCollectionData() {
    if (collections.length === 0) {
      return;
    }

    try {
      const collectionIdQuery = collections.map(encodeURIComponent).join(",");
      console.log(collectionIdQuery);
      const response = await fetch(
        `https://ytgrqowmsrgrcjrpzgum.supabase.co/functions/v1/fetch_collection?collectionIds=${collectionIdQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg",  // 👈 Supabase ANON-KEY
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg"
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.allCollections) {
        const options = data.allCollections.map((collection) => ({
          label: collection.title,
          value: collection.id,
        }));
        setCollectionOptions(options);
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    }
  }

  async function fetchCutoutData() {
    try {
      let cutoutIdQuery = "";
      
      // Wenn Cutouts vorhanden sind, Query-String erstellen
      if (Array.isArray(cutouts) && cutouts.length > 0) {
        cutoutIdQuery = cutouts.map(encodeURIComponent).join(",");
        console.log("Cutout Query:", cutoutIdQuery);
      } else {
        console.warn("Keine Cutouts vorhanden, lade nur verfügbare Optionen.");
      }
  
      // API-Aufruf
      const response = await fetch(
        `https://ytgrqowmsrgrcjrpzgum.supabase.co/functions/v1/fetch_product${cutoutIdQuery ? `?productIds=${cutoutIdQuery}` : ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg",  // 👈 Supabase ANON-KEY
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg"
          },
        }
      );
  
      // Fehlerhafte Response abfangen
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Fehler beim Abrufen der Cutouts: ${response.status} - ${errorText}`
        );
        return;
      }
  
      // JSON-Daten extrahieren
      const data = await response.json();
      console.log("Erhaltene Cutout-Daten:", data);
  
      // Optionen aus `allProducts` setzen
      if (data.allProducts) {
        const options = data.allProducts.map((product) => ({
          label: product.title,
          value: product.id,
        }));
        setCutoutOptions(options);
        console.log("Erstellte Optionen:", options);
      } else {
        console.warn("Keine Produkte in der Antwort gefunden.");
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Cutouts:", error);
    }
  }  

  useEffect(() => {
    fetchContractData();
  }, [data]);

  useEffect(() => {
    fetchCollectionData();
  }, [collections]);

  useEffect(() => {
    fetchCutoutData();
  }, [cutouts]);

  console.log("Collections:", collections);
  console.log("Cutouts:", cutouts);

  const saveChanges = async () => {
    const rawCustomerId = data.selected[0]?.id;
    if (!rawCustomerId) {
      console.error("Customer ID fehlt.");
      setLoading(false);
      return;
    }
  
    const customerId = extractCustomerId(rawCustomerId);
    setLoading(true);
  
    const payload = {
      customer_id: customerId,
      interval: interval,
      status,
      pause_start: pauseStart || null,
      pause_end: pauseEnd || null,
      collection_ids: ensureArray(collections), // Statt product_ids
      cut_outs: ensureArray(cutouts), // Hinzugefügt für Ausschlüsse
    };
  
    console.log("Payload zum Speichern:", payload);
  
    try {
      const response = await fetch(
        "https://ytgrqowmsrgrcjrpzgum.supabase.co/functions/v1/update_contract_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg",  // 👈 Supabase ANON-KEY
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Z3Jxb3dtc3JncmNqcnB6Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTM1NjcsImV4cCI6MjA0OTUyOTU2N30.NyKaM5WkV_hWH3ORT49lvv3yvgIQfuzecrQugJgN5fg"
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (response.ok) {
        console.log("Änderungen erfolgreich gespeichert.");
        setSuccessMessage("Änderungen erfolgreich gespeichert!");
      } else {
        const errorDetails = await response.text();
        console.error("Fehler beim Speichern der Änderungen:", errorDetails);
        alert("Fehler beim Speichern der Änderungen");
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Änderungen:", error);
    } finally {
      fetchContractData();
      setLoading(false);
    }
  };

  return (
    <AdminBlock title="Abonnement Details">
      {currentPage === 1 && (
        <BlockStack spacing="tight">
          <Text>
            <Text emphasis="strong">Status:</Text> {status || "N/A"}
          </Text>
          <Text>
            <Text emphasis="strong">Aktivierung:</Text> {contractData.activation_date || "N/A"}
          </Text>
          <Text>
            <Text emphasis="strong">Letzte Lieferung:</Text> {contractData.last_delivery_date || "N/A"}
          </Text>
          <Text>
            <Text emphasis="strong">Nächste Lieferung:</Text>{" "}
            {contractData.planned_next_delivery_date || "N/A"}
          </Text>
          <Text>
            <Text emphasis="strong">Kündigungsdatum:</Text> {contractData.cancelation_date || "N/A"}
          </Text>
        </BlockStack>
      )}
      {currentPage === 2 && (
        <BlockStack>
          <Select
            label="Status"
            options={[
              { value: "active", label: "Aktiv" },
              { value: "paused", label: "Pausiert" },
              { value: "pre_canceled", label: "Pre-Canceled" },
              { value: "canceled", label: "Storniert" },
            ]}
            value={status}
            onChange={(value) => {
              setStatus(value);
              if (value !== "paused") {
                setPauseStart("");
                setPauseEnd("");
                setSelected({ start: null, end: null });
              }
            }}
          />
          {status === "paused" && (
            <>
              <Text>Pausierungszeitraum auswählen (Montag - Sonntag)</Text>
              <DatePicker
                selected={selected}
                onChange={(newSelected) => {
                  const { start, end } = newSelected || {};
                  if (start && new Date(start).getDay() !== 1) {
                    alert("Pausenstart muss ein Montag sein.");
                    return;
                  }
                  if (end && new Date(end).getDay() !== 0) {
                    alert("Pausenende muss ein Sonntag sein.");
                    return;
                  }
                  setSelected(newSelected);
                  setPauseStart(start);
                  setPauseEnd(end);
                }}
                allowRange
                accessibilityLabel="Wählen Sie einen Zeitraum für die Pause aus"
              />
            </>
          )}
          <Select
            label="Lieferintervall"
            options={[
              { value: "weekly", label: "Wöchentlich" },
              { value: "biweekly", label: "Zweiwöchentlich" },
              { value: "monthly", label: "Monatlich" },
            ]}
            value={interval}
            onChange={(value) => setInterval(value)}
          />
        </BlockStack>
      )}
      {currentPage === 3 && (
        <BlockStack spacing="tight">
        {Array.isArray(collections) && collections.length > 0 ? (
          collections.map((collectionId, index) => (
            <Select
              key={index}
              label={`Produkt ${index + 1}`}
              options={[
                { label: "Kein Produkt auswählen", value: "" },
                ...collectionOptions,
              ]}
              value={collectionId}
              onChange={(value) => {
                setCollections((prevCollections) => {
                  const updatedCollections = [...prevCollections];
                  if (value === "") {
                    updatedCollections.splice(index, 1);
                  } else {
                    updatedCollections[index] = value;
                  }
                  return updatedCollections;
                });
              }}
            />
          ))
        ) : (
          <Text>Keine Collections verfügbar</Text>
        )}
        <Select
          key={collections.length}
          label="Neues Produkt hinzufügen"
          options={[
            { label: "Produkt hinzufügen", value: "" },
            ...collectionOptions,
          ]}
          value={valueondropdown}
          onChange={(value) => {
            if (value) {
              setValueOnDropdown("");
              setCollections((prevCollections) => [...prevCollections, value]);
            }
          }}
        />
      </BlockStack>     
      )}{currentPage === 4 && (
        <BlockStack spacing="tight">
          {Array.isArray(cutouts) && cutouts.length > 0 ? (
            cutouts.map((cutoutId, index) => (
              <Select
                key={index}
                label={`Ausschluss ${index + 1}`}
                options={[
                  { label: "Kein Ausschluss auswählen", value: "" },
                  ...cutoutOptions,
                ]}
                value={cutoutId}
                onChange={(value) => {
                  setCutouts((prevCutouts) => {
                    const updatedCutouts = [...prevCutouts];
                    if (value === "") {
                      updatedCutouts.splice(index, 1);
                    } else {
                      updatedCutouts[index] = value;
                    }
                    return updatedCutouts;
                  });
                }}
              />
            ))
          ) : (
            <Text>Keine Ausschlüsse verfügbar</Text>
          )}
          {cutouts.length < 3 ? ( // Bedingung: Nur anzeigen, wenn weniger als 3 Ausschlüsse vorhanden sind
            <Select
              key={cutouts.length}
              label="Neuen Ausschluss hinzufügen"
              options={[
                { label: "Ausschluss hinzufügen", value: "" },
                ...cutoutOptions,
              ]}
              value={valueondropdownCutout}
              onChange={(value) => {
                if (value) {
                  setValueOnDropdownCutout("");
                  setCutouts((prevCutouts) => [...prevCutouts, value]);
                }
              }}
            />
          ) : (
            <Text>Maximale Anzahl von 3 Ausschlüssen erreicht</Text> // Hinweis für den Benutzer
          )}
        </BlockStack>
      )}          
      <BlockStack paddingBlockEnd="large" paddingBlockStart="large">
        <Button onClick={saveChanges}>Speichern</Button>
      </BlockStack>
      <InlineStack
        inlineAlignment="center"
        inlineSize="100px"
        spacing="tight"
        columnGap="large"
      >
        <Button onClick={goToPreviousPage}>←</Button>
        <Text>{currentPage}</Text>
        <Button onClick={goToNextPage}>→</Button>
      </InlineStack>
    </AdminBlock>
  );
}

render(reactExtension(TARGET, () => <App />));



/*

curl -X POST "https://afreshed-dev-store.myshopify.com/admin/api/2023-10/graphql.json" \
-H "Content-Type: application/json" \
-H "X-Shopify-Access-Token: shpua_bee161ff2c5d2e41477ddafb5a8a53b0" \
-d '{
  "query": "query { collections(first: 50) { edges { node { id title } } } }"
}'
*/
import React, { useState } from "react";
import {
  render,
  reactExtension,
  AdminAction,
  Button,
  Text,
} from "@shopify/ui-extensions-react/admin";

const TARGET = "admin.draft-order-index.action.render";

function App() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [dateValue, setDateValue] = useState("");

  const triggerDraftOrders = async (date) => {
    if (!date) {
      alert("Kein Datum eingegeben!");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await fetch(
        "https://ytgrqowmsrgrcjrpzgum.supabase.co/functions/v1/draft_order_generation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Ersetze <YOUR_AUTH_TOKEN> durch einen gültigen Supabase Auth-Token
            Authorization: `Bearer <YOUR_AUTH_TOKEN>`,
          },
          body: JSON.stringify({ planned_next_delivery_date: date }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Draft Orders erfolgreich erstellt!");
    } catch (error) {
      alert("Fehler: " + error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    const date = window.prompt("Bitte geplantes Lieferdatum eingeben (YYYY-MM-DD):");
    if (date) {
      setDateValue(date);
      triggerDraftOrders(date);
    }
  };

  return (
    <AdminAction title="Draft Order Generation">
      <Button onClick={handleClick} loading={loading}>
        Draft Orders erstellen
      </Button>
    </AdminAction>
  );
}

render(reactExtension(TARGET, () => <App />));






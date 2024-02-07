"use client";
/*
Note: "use client" is a Next.js App Router directive that instructs React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import type { Database } from "@/lib/schema";
import Image from "next/image";
import SpeciesDetailsDialog from "./species-details-dialog";
type Species = Database["public"]["Tables"]["species"]["Row"];

// First, ensure you import useState for handling state
import { createBrowserSupabaseClient } from "@/lib/client-utils"; // Adjust the import path as needed
import { useEffect, useState } from "react";

// Assuming your type definition for a species is accurate and complete

export default function SpeciesCard({ species, currentUser }: { species: Species; currentUser: string }) {
  // Add state for hover effect
  const [isHovered, setIsHovered] = useState(false);
  const [authorName, setAuthorName] = useState(""); // State to hold the author's display name

  useEffect(() => {
    // Function to fetch the author's display name
    const fetchAuthorDisplayName = async () => {
      const supabaseClient = createBrowserSupabaseClient();
      const { data, error } = await supabaseClient
        .from("profiles") // Assuming 'profiles' is the name of your table
        .select("display_name")
        .eq("id", species.author) // Use the author ID to fetch the display name
        .single(); // Assuming author ID is unique and returns a single record

      if (error) {
        console.error("Error fetching author details:", error);
      } else if (data) {
        setAuthorName(data.display_name); // Update the state with the fetched display name
      }
    };

    if (species.author) {
      void fetchAuthorDisplayName();
    }
  }, [species.author]);

  // Function to delete a species
  const deleteSpecies = async () => {
    const supabaseClient = createBrowserSupabaseClient();
    const { error } = await supabaseClient.from("species").delete().match({ id: species.id });

    if (error) {
      alert(`Error deleting species: ${error.message}`);
    } else {
      // Reload the page to reflect the deletion
      // For a more advanced implementation, you might want to update the list in the parent component without reloading.
      window.location.reload();
    }
  };

  return (
    <div
      className="relative m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && species.author === currentUser && (
        <button
          onClick={() => {
            // Display confirmation dialog
            const isConfirmed = window.confirm("Are you sure you want to delete this species?");
            if (isConfirmed) {
              // If the user confirmed, proceed with the deletion
              void deleteSpecies();
            }
            // If the user cancels, do nothing
          }}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "red",
            color: "white",
            borderRadius: "50%", // Make the button round
            width: "25px",
            height: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 2.5px 5px rgba(0,0,0,0.4)", // Drop shadow
            zIndex: 10, // Ensure it's above other elements
          }}
          aria-label="Delete Species"
        >
          ✕
        </button>
      )}
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} layout="fill" style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      <SpeciesDetailsDialog species={species} currentUser={currentUser} />
      {authorName && ( // Display the author's display name
        <p className="mt-4 text-left text-sm text-gray-400">Author: {authorName}</p>
      )}
    </div>
  );
}

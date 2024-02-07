/*
  This component represents a list of species.
  It retrieves species data from the server and renders each species as a card.
  Users must be signed in to view this route, as it is protected.

  Dependencies:
  - Separator from "@/components/ui/"
  - TypographyH2 from "@/components/ui/typography"
  - createServerSupabaseClient from "@/lib/server-utils"
  - redirect from "next/navigation"
  - AddSpeciesDialog, SpeciesCard from "./" (relative imports)

  Workflow:
  - Create a Supabase server component client and retrieve user session from stored cookie
  - Redirect to the homepage if no user session is found
  - Obtain the ID of the currently signed-in user
  - Fetch species data from the server, ordered by ID in descending order
  - Render a list of species cards along with an option to add a new species

  Notes:
  - Users must be signed in to access this route
*/

import { Separator } from "@/components/ui/separator"; // Importing the Separator component
import { TypographyH2 } from "@/components/ui/typography"; // Importing the TypographyH2 component
import { createServerSupabaseClient } from "@/lib/server-utils"; // Importing function to create a server-side Supabase client
import { redirect } from "next/navigation"; // Importing redirect function for navigation
import AddSpeciesDialog from "./add-species-dialog"; // Importing AddSpeciesDialog component
import SpeciesCard from "./species-card"; // Importing SpeciesCard component

export default async function SpeciesList() {
  // Create Supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient(); // Creating a server-side Supabase client
  const {
    data: { session },
  } = await supabase.auth.getSession(); // Retrieving user session

  if (!session) {
    // Redirect to the homepage if no user session is found
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  // Fetch species data from the server, ordered by ID in descending order
  const { data: species } = await supabase.from("species").select("*").order("id", { ascending: false });

  return (
    <>
      {/* Species List Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2> {/* Title */}
        <AddSpeciesDialog userId={sessionId} /> {/* Component to add a new species */}
      </div>
      <Separator className="my-4" /> {/* Separator component */}
      {/* List of Species Cards */}
      <div className="flex flex-wrap justify-center">
        {/* Render each species card */}
        {species?.map((species) => (
          <SpeciesCard key={species.id} species={species} currentUser={sessionId} /> // Species card component
        ))}
      </div>
    </>
  );
}

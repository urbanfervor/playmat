"use client";
import { isAdmin } from "@/lib/admin";
import { useUser } from "@/lib/useUser";
import { NewTournamentForm } from "@/components/tournament/NewTournamentForm";

export function AdminTools() {
  return isAdmin(useUser()) ? <NewTournamentForm /> : null;
}

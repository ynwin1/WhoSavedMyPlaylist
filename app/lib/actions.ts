"use server"
import { fetchFromSpotify, User } from "@/app/dashboard/(dashboard)/page";

export async function refreshDashboard(user: User, headers: any) {
    await fetchFromSpotify(user, headers);
}
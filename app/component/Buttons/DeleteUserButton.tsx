"use client";
import React from "react";
import {signOut} from "next-auth/react";

async function delete_user(user_id: string) {
    try {
        const response = await fetch(`/api/user/${user_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete user");
        }

        await signOut({redirect: true, callbackUrl: "/"});
    } catch (error) {
        console.log("Error deleting user:", error);
    }
}

const DeleteUserButton = ({user_id} : {user_id: string}) => {
    return (
        <button
            onClick={() => delete_user(user_id)}
            className="
            px-4 py-2 rounded-full bg-red-500 hover:bg-red-800 text-white hover:text-black font-medium
                 transform transition-all duration-300 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                 border-2 border-white
                 "
        >
            Delete my account
        </button>
    )
}
export default DeleteUserButton;
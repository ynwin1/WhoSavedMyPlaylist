"use client";
import React, {useState} from "react";
import {signOut} from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";

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
        toast.error("Failed to delete your account. Please try again later.");
        console.log("Error deleting user:", error);
    }
}

const PopUp = ({user_id, setShowPopUp} : {user_id: string, setShowPopUp : React.Dispatch<React.SetStateAction<boolean>>}) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-spotify p-4 rounded-lg">
                <h1 className="text-2xl font-bold text-black">Are you sure you want to delete your account?</h1>
                <h3 className="text-lg font-medium text-black">This action will remove your profile permanently.</h3>
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => delete_user(user_id)}
                        className="
                        px-4 py-2 rounded-full bg-red-500 hover:bg-red-800 text-white font-medium
                             transform transition-all duration-300 hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                             border-2 border-white
                             "
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => setShowPopUp(false)}
                        className="
                        px-4 py-2 rounded-full bg-green-500 hover:bg-green-800 text-white font-medium
                             transform transition-all duration-300 hover:scale-105
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                             border-2 border-white
                             "
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    )
}

const DeleteUserButton = ({user_id} : {user_id: string}) => {
    const [showPopUp, setShowPopUp] = useState(false);
    return (
        <div className="self-center flex flex-col items-center justify-center mt-10 mb-10">
            <Toaster />
            <button
                onClick={() => setShowPopUp(true)}
                className="
             px-4 py-2 rounded-full bg-red-500 hover:bg-red-800 text-white hover:text-black font-medium
                 transform transition-all duration-300 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black
                 border-2 border-white
                 "
            >
                Delete my account
            </button>
            {showPopUp && <PopUp user_id={user_id} setShowPopUp={setShowPopUp}/>}
        </div>

    )
}
export default DeleteUserButton;
import React, { createContext, useContext, useState, useEffect } from "react";
import { getItem } from "@/utils/local_storage";

const CardContext = createContext();

export const useCardContext = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
    const [isCard, setIsCard] = useState(false);
    const userRole = getItem("userRole");

    // Reset to false if not user role, though the switch is only shown for user role.
    useEffect(() => {
        if (userRole !== "user") {
            setIsCard(false);
        }
    }, [userRole]);

    return (
        <CardContext.Provider value={{ isCard, setIsCard }}>
            {children}
        </CardContext.Provider>
    );
};

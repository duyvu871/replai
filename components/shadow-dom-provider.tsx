import React, { createContext, useContext, useEffect, useState } from "react";

const ShadowDomContext = createContext<ShadowRoot | null>(null);

export const useShadowRoot = () => useContext(ShadowDomContext);

export const ShadowDomProvider = ({
    children,
    shadowRoot,
}: {
    children: React.ReactNode;
    shadowRoot: ShadowRoot;
}) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            // Facebook uses __fb-dark-mode class on the html element
            const isDark = document.documentElement.classList.contains("__fb-dark-mode");
            console.log("isDark", isDark);
            setIsDark(isDark);
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <ShadowDomContext.Provider value={shadowRoot}>
            <div id="shadcn-container" className={`font-sans antialiased ${isDark ? "dark" : ""}`}>
                {children}
            </div>
        </ShadowDomContext.Provider>
    );
};

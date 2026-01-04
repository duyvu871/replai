export const FB_INPUT_SELECTOR = '[contenteditable="true"], [role="textbox"]';

export function getFocusedInput(): HTMLElement | null {
    const el = document.activeElement as HTMLElement;
    if (el && (el.isContentEditable || el.getAttribute("role") === "textbox")) {
        return el;
    }
    return null;
}

export function insertTextToInput(element: HTMLElement, text: string) {
    element.focus();
    // Use execCommand for simple contenteditable
    // Facebook might require simulated input events
    const success = document.execCommand("insertText", false, text);

    if (!success) {
        // Fallback: Dispatch Input Events
        // This is complex for Facebook DraftJS/Lexical, but simple text insertion might work via execCommand usually.
        console.warn("execCommand failed, trying manual composition");
        // TODO: Implement more robust insertion if needed
    }
}

export async function getFullPostContent(container: HTMLElement): Promise<string> {
    const seeMoreBtn = findSeeMoreButton(container);

    if (seeMoreBtn) {
        seeMoreBtn.click();

        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return extractCleanText(container);
}

export function findSeeMoreButton(container: HTMLElement): HTMLElement | null {
    const xpath = ".//div[@role='button' and (contains(text(), 'Xem thêm') or contains(text(), 'See more'))]";
    const result = document.evaluate(xpath, container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

    return result.singleNodeValue as HTMLElement;
}

export function extractCleanText(container: HTMLElement): string {
    const contentDiv = container.querySelector('[data-ad-preview="message"]') || container.querySelector('div[dir="auto"]');

    if (contentDiv) {
        return (contentDiv as HTMLElement).innerText;
    }

    return container.innerText;
}
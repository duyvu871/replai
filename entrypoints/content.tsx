import "~/assets/tailwind.css";
import { createRoot } from "react-dom/client";
import { ShadowDomProvider } from "@/components/shadow-dom-provider";
import { PostTrigger } from "@/components/post-trigger";
import { insertTextToInput, getFullPostContent } from "@/lib/facebook";

export default defineContentScript({
    matches: ["https://www.facebook.com/*", "https://web.facebook.com/*"],
    cssInjectionMode: "ui",
    async main(ctx) {
        const observer = new MutationObserver((mutations) => {
            if (!browser.runtime?.id) {
                observer.disconnect();
                return;
            }
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        scanForPosts(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        scanForPosts(document.body);
    },
});

function scanForPosts(root: HTMLElement) {
    const optionButtons = root.querySelectorAll('[aria-haspopup="menu"][role="button"]');
    optionButtons.forEach((btn) => {
        if (btn.getAttribute("data-replai-injected") === "true") return;
        if (btn.getAttribute("aria-label") !== "Hành động với bài viết này") return;

        const parent = btn.parentElement;
        if (!parent) return;

        btn.setAttribute("data-replai-injected", "true");

        const mountPoint = document.createElement("div");
        mountPoint.style.display = "inline-block";
        mountPoint.style.marginRight = "8px";

        const parentContainer = parent?.parentElement?.parentElement;
        if (!parentContainer) return;
        parentContainer.appendChild(mountPoint);

        initShadowTrigger(mountPoint, btn as HTMLElement);
    });
}

function initShadowTrigger(container: HTMLElement, optionsBtn: HTMLElement) {
    if (!browser.runtime?.id) return;

    const shadowRoot = container.attachShadow({ mode: "open" });
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    // This is the built tailwind CSS
    // @ts-ignore
    styleLink.href = browser.runtime.getURL("content-scripts/content.css");
    shadowRoot.appendChild(styleLink);

    const root = createRoot(shadowRoot);

    const handleInsert = (text: string) => {
        if (!browser.runtime?.id) return;
        const post = optionsBtn.closest('div[role="article"]') || optionsBtn.closest('.x1yztbdb');
        if (post) {
            const input = post.querySelector('[contenteditable="true"], [role="textbox"]') as HTMLElement;
            if (input) {
                insertTextToInput(input, text);
            } else {
                navigator.clipboard.writeText(text);
            }
        } else {
            navigator.clipboard.writeText(text);
        }
    }

    const handleGetText = async () => {
        if (!browser.runtime?.id) return "";
        const post = optionsBtn?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
        console.log(post);
        if (post) {
            const content = await getFullPostContent(post as HTMLElement);
            console.log('content', content);
            return content;
        }
        return "";
    }

    root.render(
        <ShadowDomProvider shadowRoot={shadowRoot}>
            <PostTrigger onInsert={handleInsert} onGetText={handleGetText} />
        </ShadowDomProvider>
    );
}

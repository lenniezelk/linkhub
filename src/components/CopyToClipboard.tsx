import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";

function CopyToClipboard({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition cursor-pointer"
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

export default CopyToClipboard;
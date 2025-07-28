// src/components/ChatPanel.tsx

import React, { useState } from 'react';
import Chat from './Chat';
import { FaRegFileAlt } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';

const samplePrompts = [
    '“What is the main topic of the document?”',
    '“Can you summarize the key points?”',
    '“What are the conclusions or recommendations?”',
];

interface ChatPanelProps {
    docId: string;
    onCitationClick: (page: number) => void;
}

/**
 * ChatPanel component displays:
 * - Document-ready card with recommendations & close button
 * - Chat component to ask questions
 *
 * @param docId - Document identifier
 * @param onCitationClick - Callback for citation clicks to jump PDF pages
 */
const ChatPanel: React.FC<ChatPanelProps> = ({ docId, onCitationClick }) => {
    const [showRecommendations, setShowRecommendations] = useState(true);
    const [starterMsg, setStarterMsg] = useState<string>('');

    // Set starter message to prompt chat on example click
    const handleSampleClick = (text: string) => {
        setStarterMsg(text.replace(/[“”]/g, '')); // sanitize quotes
    };

    return (
        <div className="flex flex-col h-full min-h-screen">
            {showRecommendations && (
                <section
                    className="relative p-6 m-4 rounded-lg border border-pink-200 bg-pink-50 select-none"
                    aria-label="Document ready information"
                    role="region"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setShowRecommendations(false)}
                        aria-label="Close recommendations"
                        title="Close recommendations"
                        className="absolute top-2 right-2 text-pink-700 hover:text-pink-900 focus:outline-none rounded"
                    >
                        <AiOutlineClose size={20} />
                    </button>

                    {/* Header with icon */}
                    <div className="flex items-center mb-3 gap-2 text-pink-800 text-lg font-semibold">
                        <FaRegFileAlt size={24} />
                        <h2 className="m-0">Your document is ready</h2>
                    </div>

                    {/* Recommendations list */}
                    <div className="text-pink-900 leading-relaxed text-sm">
                        <p className="mb-2">You can ask questions like:</p>
                        <div className="space-y-1 pl-1">
                            {samplePrompts.map((prompt, idx) => (
                                <div key={idx}>
                                    <button
                                        className="text-left text-pink-900 hover:underline focus:outline-none w-full"
                                        onClick={() => handleSampleClick(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>
            )}

            {/* Chat component fills remainder of vertical space */}
            <div className={`flex-grow p-2 ${showRecommendations ? 'mt-2' : 'mt-0'}`}>
                <Chat docId={docId} onCitationClick={onCitationClick} starterMsg={starterMsg} />
            </div>
        </div>
    );
};

export default ChatPanel;

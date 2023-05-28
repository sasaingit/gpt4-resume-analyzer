import {useRef, useState, useEffect} from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import {Message} from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import {Document} from 'langchain/document';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
    const [query, setQuery] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [dummyToken, setDummyToken] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [messageState, setMessageState] = useState<Message[]>([]);

    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    async function handleSubmit(e: any) {
        e.preventDefault();

        setError(null);

        if (!query || !city) {
            alert('Please input a question and a location');
            return;
        }

        const question = `${query} City: ${city}`.trim();

        setMessageState([
            {
                type: 'userMessage',
                message: question,
            },
        ]);

        setLoading(true);
        setQuery('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': dummyToken
                },
                body: JSON.stringify({
                    question,
                }),
            });
            const data = await response.json();
            console.log('data', data);

            if (data.error) {
                setError(data.error);
            } else {
                setMessageState([
                    ...messageState,
                    {
                        type: 'userMessage',
                        message: question,
                    },
                    {
                        type: 'apiMessage',
                        message: data.text,
                        sourceDocs: data.sourceDocuments,
                    },
                ]);
            }
            console.log('messageState', messageState);

            setLoading(false);

            messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
        } catch (error) {
            setLoading(false);
            setError('An error occurred while fetching the data. Please try again.');
            console.log('error', error);
        }
    }

    // prevent empty submissions
    const handleEnter = (e: any) => {
        if (e.key === 'Enter' && query) {
            handleSubmit(e);
        } else if (e.key == 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <>
            <Layout>
                <div className="mx-auto flex flex-col gap-4">
                    <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
                        EventPulse: Talent Recommendations
                    </h1>
                    <main className={styles.main}>

                        <div className={styles.center}>
                            <div className={styles.cloudform}>
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <textarea
                                            disabled={loading}
                                            onKeyDown={handleEnter}
                                            ref={textAreaRef}
                                            autoFocus={false}
                                            rows={1}
                                            maxLength={512}
                                            id="userInput"
                                            name="userInput"
                                            placeholder={
                                                loading
                                                    ? 'Waiting for response...'
                                                    : 'Seek. Find. Talent Unleashed.'
                                            }
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className={styles.textarea}
                                        />
                                    </div>

                                    <div className={styles.controls}>
                                        <div>
                                            <select
                                                onChange={(e) => setCity(e.target.value)}
                                                className={styles.select}
                                            >
                                                <option value="">Select your city</option>
                                                <option value="Sydney">Sydney</option>
                                                <option value="Melbourne">Melbourne</option>
                                                <option value="Brisbane">Brisbane</option>
                                                <option value="Perth">Perth</option>
                                                <option value="Adelaide">Adelaide</option>
                                                <option value="Gold Coast">Gold Coast</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input type="text" className={styles.select}  placeholder={'Enter your token'} onChange={(e) => setDummyToken(e.target.value)}></input>
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={styles.generatebutton}
                                            >
                                                {loading ? (
                                                    <div className={styles.loadingwheel}>
                                                        <LoadingDots color="#000"/>
                                                    </div>
                                                ) : (
                                                    <div className={`${styles.buttoncontent} ${styles.nobreak}`}>
                                                        <div>SEND REQUEST</div>
                                                        <svg
                                                            viewBox="0 0 20 20"
                                                            className={styles.svgicon}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>


                        <div className={styles.cloud}>
                            <div ref={messageListRef} className={styles.messagelist}>
                                {messageState.map((message, index) => {
                                    let icon;
                                    let className;
                                    if (message.type === 'apiMessage') {
                                        icon = (
                                            <Image
                                                key={index}
                                                src="/bot-image.png"
                                                alt="AI"
                                                width="40"
                                                height="40"
                                                className={styles.boticon}
                                                priority
                                            />
                                        );
                                        className = styles.apimessage;
                                    } else {
                                        icon = (
                                            <Image
                                                key={index}
                                                src="/usericon.png"
                                                alt="Me"
                                                width="30"
                                                height="30"
                                                className={styles.usericon}
                                                priority
                                            />
                                        );
                                        // The latest message sent by the user will be animated while waiting for a response
                                        className =
                                            loading && index === messageState.length - 1
                                                ? styles.usermessagewaiting
                                                : styles.usermessage;
                                    }
                                    return (
                                        <>
                                            <div key={`chatMessage-${index}`} className={className}>
                                                {icon}
                                                <div className={styles.markdownanswer}>
                                                    <ReactMarkdown linkTarget="_blank">
                                                        {message.message}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            {message.sourceDocs && (
                                                <div
                                                    className="p-5"
                                                    key={`sourceDocsAccordion-${index}`}
                                                >
                                                    <Accordion
                                                        type="single"
                                                        collapsible
                                                        className="flex-col"
                                                    >
                                                        {message.sourceDocs.map((doc, index) => (
                                                            <div key={`messageSourceDocs-${index}`}>
                                                                <AccordionItem value={`item-${index}`}>
                                                                    <AccordionTrigger>
                                                                        <h3>Source {index + 1}</h3>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent>
                                                                        <ReactMarkdown linkTarget="_blank">
                                                                            {doc.pageContent}
                                                                        </ReactMarkdown>
                                                                        <p className="mt-2">
                                                                            <b>Source:</b> {doc.metadata.source}
                                                                        </p>
                                                                    </AccordionContent>
                                                                </AccordionItem>
                                                            </div>
                                                        ))}
                                                    </Accordion>
                                                </div>
                                            )}
                                        </>
                                    );
                                })}
                            </div>
                        </div>

                        {error && (
                            <div className="border border-red-400 rounded-md p-4">
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}
                    </main>
                </div>
            </Layout>
        </>
    );
}

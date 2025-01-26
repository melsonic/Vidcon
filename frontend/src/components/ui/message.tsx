export function MessageArea({ sent, received }: { sent: Array<string>; received: Array<string> }) {
    console.log(`sent len = ${sent.length}`)
    console.log(`received len = ${received.length}`)

    const maxLength = Math.max(sent.length, received.length);

    const combinedMessages = [];
    for (let i = 0; i < maxLength; i++) {
        if (i < sent.length) {
            combinedMessages.push(
                <div key={`sent-${i}`} className="bg-gray-300 text-black">
                    {sent[i]}
                </div>
            );
        }
        if (i < received.length) {
            combinedMessages.push(
                <div key={`received-${i}`} className="bg-gray-700 text-white">
                    {received[i]}
                </div>
            );
        }
    }

    // Render combined messages
    return <div>{combinedMessages}</div>;
}

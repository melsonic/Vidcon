export function MessageArea({ sent, received, firstMessage }: { sent: Array<string>; received: Array<string>; firstMessage: boolean }) {
    const maxLength = Math.max(sent.length, received.length);

    const combinedMessages = [];
    for (let i = 0; i < maxLength; i++) {
        let sm = null, rm = null;
        if (i < sent.length) {
            sm = <div key={`sent-${i}`} className="bg-gray-300 text-black rounded-sm my-2">
                {sent[i]}
            </div>;
        }
        if (i < received.length) {
            rm = <div key={`received-${i}`} className="bg-gray-700 text-white rounded-sm my-2">
                {received[i]}
            </div>;
        }
        if(sm !== null && rm !== null) {
            console.log(firstMessage);
            if(firstMessage) {
                combinedMessages.push(sm, rm);
            } else {
                combinedMessages.push(rm, sm);
            }
        } else {
            if(sm !== null) combinedMessages.push(sm);
            if(rm !== null) combinedMessages.push(rm);
        }
        
    }

    // Render combined messages
    return <div>{combinedMessages}</div>;
}

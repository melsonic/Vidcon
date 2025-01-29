export function MessageArea({ sent, received, firstMessage }: { sent: Array<string>; received: Array<string>; firstMessage: boolean }) {
    const maxLength = Math.max(sent.length, received.length);

    const combinedMessages = [];
    for (let i = 0; i < maxLength; i++) {
        let sm = null, rm = null;
        if (i < sent.length) {
            sm = <div key={`sent-${i}`} className="bg-lightblue text-black rounded-lg my-2 self-end px-4 py-2 max-w-96">
                {sent[i]}
            </div>;
        }
        if (i < received.length) {
            rm = <div key={`received-${i}`} className="bg-darkblue text-white rounded-lg my-2 self-start px-4 py-2 max-w-96">
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
    return <div className="h-[750px] flex flex-col">{combinedMessages}</div>;
}

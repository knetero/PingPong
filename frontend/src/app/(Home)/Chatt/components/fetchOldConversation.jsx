
import axios from 'axios';

export const fetchOldConversation = async (loggedInUser, friend) => 
    {
        try {
            const response = await axios.get("https://10.13.7.8/api/chat/messages",
            { withCredentials: true, headers: {} }
            );
            const allMessages = response.data.messages;



            const filteredMessages = allMessages.filter((message) => {
                return (
                    (message.sender === loggedInUser.username && message.receiver === friend.username)
                    || (message.sender === friend.username && message.receiver === loggedInUser.username)
                );
            });

            return filteredMessages;
            
        } catch (error) {
            console.error("Error catched fetching old conversation ...", error);
        }
    }
import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]); // State to hold messages
  const [input, setInput] = useState(''); // State for user input
  const [loading, setLoading] = useState(false); // Loading state

  // Function to send a message
  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent sending empty messages

    setLoading(true); // Set loading state to true
    try {
      // Send message to the chatbot API
      const response = await axios.post('https://ecomback-rho.vercel.app/chatbot', { message: input });

      // Extracting and formatting the actual text from the nested response structure
      const botResponse = response.data.response?.response?.candidates[0]?.content?.parts[0]?.text || 
                          'Invalid response from bot';

      // Format the bot's response to include line breaks and bullet points
      const formattedResponse = botResponse
        .replace(/(\n|\r\n)/g, '<br />') // Replace new lines with HTML line breaks
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Replace bold Markdown with HTML strong
        .replace(/\*\s*(.*?)\n/g, '<li>$1</li>'); // Replace bullet points with HTML list items

      // Update messages state with user and bot messages
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: input, sender: 'user' }, 
        { text: formattedResponse, sender: 'bot', isFormatted: true } // Mark as formatted
      ]);
      setInput(''); // Clear input field
    } catch (error) {
      console.error('Error:', error); // Log the error
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: 'Error: Unable to get a response.', sender: 'bot' }
      ]);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ 
        marginBottom: '20px', 
        height: '300px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px' 
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> 
            <span dangerouslySetInnerHTML={{ __html: msg.isFormatted ? msg.text : msg.text }} />
          </div>
        ))}
        {loading && <div>Loading...</div>} {/* Show loading indicator */}
      </div>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        style={{ width: 'calc(100% - 80px)', marginRight: '10px' }} 
      />
      <button onClick={sendMessage} style={{ padding: '10px' }}>Send</button>
    </div>
  );
};

export default Chatbot;

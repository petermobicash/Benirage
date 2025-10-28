import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PublicChatInterface from '../components/chat/PublicChatInterface';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PublicChat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || 'public-support';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          <PublicChatInterface roomId={roomId} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicChat;
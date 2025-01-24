'use client';

import { useSearchParams } from 'next/navigation';
import SingleAIGame from './SingleAIGame';

function SingleAIGamePage() {
    const searchParams = useSearchParams();
    const map = searchParams.get('map');
    const username = searchParams.get('username');

    const playerData = {
        username,
        map,

    };

    return (
        
            <SingleAIGame playerData={playerData} />
    );
}

export default SingleAIGamePage;
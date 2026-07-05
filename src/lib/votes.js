import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { withTimeout } from './asyncTimeout';

function voteDocId(attractionId, nickname) {
  return `${attractionId}_${nickname.trim()}`;
}

function toVotesByAttraction(snapshot) {
  const votesByAttraction = {};
  snapshot.docs.forEach((d) => {
    const { attractionId, nickname } = d.data();
    if (!attractionId || !nickname) return;
    if (!votesByAttraction[attractionId]) votesByAttraction[attractionId] = [];
    votesByAttraction[attractionId].push(nickname);
  });
  return votesByAttraction;
}

export async function submitVote(attractionId, nickname) {
  const cleanNickname = nickname.trim();
  if (cleanNickname.includes('/')) {
    throw new Error('暱稱不能包含斜線 /，請換一個暱稱。');
  }

  const ref = doc(db, 'votes', voteDocId(attractionId, cleanNickname));

  await withTimeout(
    setDoc(ref, {
      attractionId,
      nickname: cleanNickname,
      createdAt: serverTimestamp(),
    }),
    'Firebase 投票逾時，請檢查網路後再試一次。'
  );
}

export function subscribeToAllVotes(callback, onError) {
  const votesRef = collection(db, 'votes');

  getDocs(votesRef)
    .then((snapshot) => callback(toVotesByAttraction(snapshot)))
    .catch((error) => {
      console.error('subscribeToAllVotes initial fetch failed:', error);
      if (onError) onError(error);
    });

  return onSnapshot(
    votesRef,
    (snapshot) => callback(toVotesByAttraction(snapshot)),
    (error) => {
      console.error('subscribeToAllVotes listener failed:', error);
      if (onError) onError(error);
    }
  );
}

import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

function voteDocId(attractionId, nickname) {
  return `${attractionId}_${nickname}`;
}

function toVotesByAttraction(snapshot) {
  const votesByAttraction = {};
  snapshot.docs.forEach((d) => {
    const { attractionId, nickname } = d.data();
    if (!votesByAttraction[attractionId]) votesByAttraction[attractionId] = [];
    votesByAttraction[attractionId].push(nickname);
  });
  return votesByAttraction;
}

export async function toggleVote(attractionId, nickname, hasVoted) {
  const ref = doc(db, 'votes', voteDocId(attractionId, nickname));
  if (hasVoted) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      attractionId,
      nickname,
      createdAt: serverTimestamp(),
    });
  }
}

export function subscribeToAllVotes(callback) {
  const votesRef = collection(db, 'votes');

  // 一次性讀取當保底,避免即時監聽連不上時票數畫面一直是空的。
  getDocs(votesRef)
    .then((snapshot) => callback(toVotesByAttraction(snapshot)))
    .catch((error) => console.error('subscribeToAllVotes initial fetch failed:', error));

  return onSnapshot(
    votesRef,
    (snapshot) => callback(toVotesByAttraction(snapshot)),
    (error) => console.error('subscribeToAllVotes listener failed:', error)
  );
}

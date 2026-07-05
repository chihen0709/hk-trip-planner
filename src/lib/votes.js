import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

function voteDocId(attractionId, nickname) {
  return `${attractionId}_${nickname}`;
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
  return onSnapshot(collection(db, 'votes'), (snapshot) => {
    const votesByAttraction = {};
    snapshot.docs.forEach((d) => {
      const { attractionId, nickname } = d.data();
      if (!votesByAttraction[attractionId]) votesByAttraction[attractionId] = [];
      votesByAttraction[attractionId].push(nickname);
    });
    callback(votesByAttraction);
  });
}

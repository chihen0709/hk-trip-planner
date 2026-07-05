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

const LOCAL_VOTES_KEY = 'hk-trip-planner:local-votes';

function voteDocId(attractionId, nickname) {
  return `${attractionId}_${nickname}`;
}

function readLocalVotes() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalVotes(votesByAttraction) {
  localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votesByAttraction));
}

function mergeVotes(...maps) {
  const merged = {};
  maps.forEach((map) => {
    Object.entries(map || {}).forEach(([attractionId, nicknames]) => {
      merged[attractionId] = [
        ...new Set([...(merged[attractionId] || []), ...(nicknames || [])]),
      ];
    });
  });
  return merged;
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
  const localVotes = readLocalVotes();
  const localNames = new Set(localVotes[attractionId] || []);

  if (hasVoted) {
    localNames.delete(nickname);
    try {
      await deleteDoc(ref);
    } catch (error) {
      console.error('toggleVote Firestore delete failed, saved locally:', error);
    }
  } else {
    localNames.add(nickname);
    try {
      await setDoc(ref, {
        attractionId,
        nickname,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('toggleVote Firestore write failed, saved locally:', error);
    }
  }

  localVotes[attractionId] = [...localNames];
  writeLocalVotes(localVotes);
}

export function subscribeToAllVotes(callback) {
  const votesRef = collection(db, 'votes');

  callback(readLocalVotes());

  getDocs(votesRef)
    .then((snapshot) => callback(mergeVotes(readLocalVotes(), toVotesByAttraction(snapshot))))
    .catch((error) => console.error('subscribeToAllVotes initial fetch failed:', error));

  return onSnapshot(
    votesRef,
    (snapshot) => callback(mergeVotes(readLocalVotes(), toVotesByAttraction(snapshot))),
    (error) => console.error('subscribeToAllVotes listener failed:', error)
  );
}

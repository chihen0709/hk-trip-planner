import { db } from '../firebase';
import {
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { createFirestoreDocument } from './firestoreRest';

const LOCAL_VOTES_KEY = 'hk-trip-planner:local-votes';

function voteDocId(attractionId, nickname) {
  return `${attractionId}_${nickname.trim()}`;
}

function readLocalVotes() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalVote(vote) {
  const id = voteDocId(vote.attractionId, vote.nickname);
  const existing = readLocalVotes().filter(
    (item) => voteDocId(item.attractionId, item.nickname) !== id
  );
  localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify([...existing, vote]));
}

function mergeVoteRows(...lists) {
  const byId = new Map();
  lists.flat().forEach((vote) => {
    if (!vote?.attractionId || !vote?.nickname) return;
    byId.set(voteDocId(vote.attractionId, vote.nickname), vote);
  });
  return [...byId.values()];
}

function votesByAttractionFromRows(rows) {
  return rows.reduce((votesByAttraction, vote) => {
    if (!votesByAttraction[vote.attractionId]) votesByAttraction[vote.attractionId] = [];
    votesByAttraction[vote.attractionId].push(vote.nickname);
    return votesByAttraction;
  }, {});
}

function toVotesByAttraction(snapshot) {
  const remoteRows = snapshot.docs.map((d) => d.data());
  return votesByAttractionFromRows(mergeVoteRows(readLocalVotes(), remoteRows));
}

export async function submitVote(attractionId, nickname) {
  const cleanNickname = nickname.trim();
  if (cleanNickname.includes('/')) {
    throw new Error('暱稱不能包含 /，請換一個暱稱。');
  }

  const vote = {
    attractionId,
    nickname: cleanNickname,
  };

  writeLocalVote(vote);
  void syncVoteToFirebase(vote).catch((error) => {
    console.error('submitVote background sync failed:', error);
  });

  return vote;
}

export async function syncVoteToFirebase({ attractionId, nickname }) {
  const cleanNickname = nickname.trim();
  await createFirestoreDocument(
    'votes',
    voteDocId(attractionId, cleanNickname),
    {
      attractionId,
      nickname: cleanNickname,
      createdAt: new Date(),
    }
  );
}

export function subscribeToAllVotes(callback, onError) {
  const votesRef = collection(db, 'votes');

  callback(votesByAttractionFromRows(readLocalVotes()));
  void Promise.all(readLocalVotes().map((vote) => syncVoteToFirebase(vote))).catch((error) => {
    console.error('local vote sync failed:', error);
  });

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

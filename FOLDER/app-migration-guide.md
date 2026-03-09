# App.tsx Firebase Migration Guide

This guide shows you how to replace the existing API calls in `src/App.tsx` with Firebase Realtime Database logic.

## 1. Imports
Add these at the top of `src/App.tsx`:
```typescript
import { ref, onValue, set, push, serverTimestamp } from "firebase/database";
import { db } from "./firebase";
```

## 2. Replace Home Page Data Fetching
**From:**
```typescript
useEffect(() => {
  fetch('/api/posts').then(res => res.json()).then(setPosts);
}, []);
```
**To:**
```typescript
useEffect(() => {
  const postsRef = ref(db, 'posts');
  const unsubscribe = onValue(postsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object map to array
      const postsList = Object.entries(data).map(([id, post]: [string, any]) => ({
        ...post,
        id: id // Use Firebase string keys as IDs
      }));
      setPosts(postsList.reverse()); // Show newest first
    }
  });
  return () => unsubscribe();
}, []);
```

## 3. Replace Post Detail Fetching
**From:**
```typescript
useEffect(() => {
  fetch(`/api/posts/${id}`).then(res => res.json()).then(setPost);
  fetch(`/api/posts/${id}/comments`).then(res => res.json()).then(setComments);
}, [id]);
```
**To:**
```typescript
useEffect(() => {
  const postRef = ref(db, `posts/${id}`);
  const commentsRef = ref(db, `comments/${id}`);

  const unsubscribePost = onValue(postRef, (snapshot) => {
    setPost(snapshot.val());
  });

  const unsubscribeComments = onValue(commentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setComments(Object.values(data));
    }
  });

  return () => {
    unsubscribePost();
    unsubscribeComments();
  };
}, [id]);
```

## 4. Replace Comment Submission
**From:**
```typescript
const handleSubmitComment = async () => {
  if (!newComment.trim()) return;
  const res = await fetch(`/api/posts/${id}/comments`, { ... });
  if (res.ok) {
    setNewComment('');
    fetch(`/api/posts/${id}/comments`).then(res => res.json()).then(setComments);
  }
};
```
**To:**
```typescript
const handleSubmitComment = async () => {
  if (!newComment.trim()) return;
  const commentsRef = ref(db, `comments/${id}`);
  const newCommentRef = push(commentsRef);
  await set(newCommentRef, {
    author: 'Alex Rivers',
    designation: 'CPE Junior Member',
    content: newComment,
    created_at: new Date().toISOString()
  });
  setNewComment('');
};
```

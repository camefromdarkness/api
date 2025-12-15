import { create } from "zustand";

export const useUsersStore = create((set) => ({
    users: [], // cached users
    posts: {}, // cached posts by userId: { [id]: [...posts] }
    usersLoading: false,
    postsLoading: {}, // { [id]: boolean }

    // actions
    setUsers: (users) => set({ users }),
    setUsersLoading: (v) => set({ usersLoading: v }),
    setPostsForUser: (userId, posts) => set((s) => ({ posts: { ...s.posts, [userId]: posts } })),
    setPostLoadingForUser: (userId, v) => set((s) => ({ postsLoading: { ...s.postsLoading, [userId]: v } })),
    setViewMode: (mode) => set({ viewMode: mode }),
    viewMode: "list",
}));

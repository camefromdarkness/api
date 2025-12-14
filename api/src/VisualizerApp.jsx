import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { create } from "zustand";

// ==========================
// Zustand store
// ==========================
const useStore = create((set) => ({
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

const API_ROOT = "https://jsonplaceholder.typicode.com";

// ==========================
// Utilities
// ==========================
async function safeFetchJson(url, signal) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    return res.json();
}

// ==========================
// Spinner (simple)
// ==========================
function Spinner({ size = 24 }) {
    return (
        <div style={{ padding: 12, textAlign: "center" }}>
            <div style={{ display: "inline-block", width: size, height: size, border: "3px solid #ccc", borderTopColor: "#333", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ==========================
// Users Page
// ==========================
function UsersPage() {
    const users = useStore((s) => s.users);
    const usersLoading = useStore((s) => s.usersLoading);
    const setUsers = useStore((s) => s.setUsers);
    const setUsersLoading = useStore((s) => s.setUsersLoading);
    const viewMode = useStore((s) => s.viewMode);
    const setViewMode = useStore((s) => s.setViewMode);

    useEffect(() => {
        if (users && users.length > 0) return; // already cached

        const ctrl = new AbortController();
        async function load() {
            try {
                setUsersLoading(true);
                const data = await safeFetchJson(`${API_ROOT}/users`, ctrl.signal);
                setUsers(data);
            } catch (e) {
                if (e.name !== "AbortError") console.error("Failed to load users:", e);
            } finally {
                setUsersLoading(false);
            }
        }

        load();
        return () => ctrl.abort();
    }, [users, setUsers, setUsersLoading]);

    return (
        <div style={{ padding: 20 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h1 style={{ margin: 0 }}>Data Visualizer</h1>
                <div>
                    <button onClick={() => setViewMode("list")} style={{ marginRight: 6 }}>List</button>
                    <button onClick={() => setViewMode("grid")}>Grid</button>
                </div>
            </header>

            {usersLoading && <Spinner />}

            {!usersLoading && (!users || users.length === 0) && (
                <div>No users available.</div>
            )}

            {!usersLoading && users && users.length > 0 && (
                <div style={{ display: viewMode === "grid" ? "grid" : "block", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    {users.map((u) => (
                        <Link key={u.id} to={`/user/${u.id}`} style={{ display: "block", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 13, color: "#555" }}>{u.email}</div>
                            <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>{u.company?.name}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================
// User Details Page
// ==========================
function UserDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const users = useStore((s) => s.users);
    const posts = useStore((s) => s.posts[id]);
    const postsLoading = useStore((s) => s.postsLoading[id]);
    const setPostsForUser = useStore((s) => s.setPostsForUser);
    const setPostLoadingForUser = useStore((s) => s.setPostLoadingForUser);

    const user = users.find((u) => String(u.id) === String(id));

    useEffect(() => {
        if (posts) return; // already cached

        const ctrl = new AbortController();
        async function load() {
            try {
                setPostLoadingForUser(id, true);
                const data = await safeFetchJson(`${API_ROOT}/users/${id}/posts`, ctrl.signal);
                setPostsForUser(id, data);
            } catch (e) {
                if (e.name !== "AbortError") console.error(`Failed to load posts for ${id}:`, e);
            } finally {
                setPostLoadingForUser(id, false);
            }
        }

        load();
        return () => ctrl.abort();
    }, [id, posts, setPostsForUser, setPostLoadingForUser]);

    return (
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
                <button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>Back</button>
                <span style={{ fontSize: 18, fontWeight: 600 }}>User Details</span>
            </div>

            {!user && (
                <div style={{ marginBottom: 12, padding: 12, border: "1px solid #f0f0f0" }}>User not found in cache. Go to home to load users first.</div>
            )}

            {user && (
                <div style={{ marginBottom: 16, padding: 12, border: "1px solid #e6e6e6", borderRadius: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{user.name} <span style={{ fontSize: 13, color: "#666" }}>({user.username})</span></div>
                    <div style={{ marginTop: 6 }}>{user.email} • {user.phone}</div>
                    <div style={{ marginTop: 6 }}>{user.website}</div>
                </div>
            )}

            <h3>Posts</h3>

            {postsLoading && <Spinner />}

            {!postsLoading && (!posts || posts.length === 0) && (
                <div>No posts available for this user.</div>
            )}

            {!postsLoading && posts && posts.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    {posts.map((p) => (
                        <article key={p.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, marginBottom: 10 }}>
                            <div style={{ fontWeight: 700 }}>{p.title}</div>
                            <p style={{ marginTop: 8 }}>{p.body}</p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================
// App shell
// ==========================
export default function VisualizerApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UsersPage />} />
                <Route path="/user/:id" element={<UserDetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

import { useState } from "react";

export const App = () => {
  const [usernameInput, setUsernameInput] = useState("");
  const [activeUsername, setActiveUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstScrape, setIsFirstScrape] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Theme state: "dark" or "light"
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const fetchPosts = async (e) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim()) return;

    setLoading(true);
    setError("");
    setPosts([]);
    setIsFirstScrape(false);

    const targetUser = usernameInput.trim().toLowerCase();

    const timer = setTimeout(() => {
      setIsFirstScrape(true);
    }, 3000);

    try {
      const response = await fetch(`/api/posts/${targetUser}`);
      const result = await response.json();

      clearTimeout(timer);

      if (result.success) {
        setPosts(result.data.posts);
        setActiveUsername(result.data.username);
      } else {
        setError(result.message || "Failed to retrieve posts.");
      }
    } catch (err) {
      clearTimeout(timer);
      setError("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
      setIsFirstScrape(false);
    }
  };

  const copyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getApiUrl = () => {
    const origin = window.location.origin;
    return `${origin}/api/posts/${activeUsername || "username"}`;
  };

  // Grayscale theme mapping
  const styles = {
    bg: theme === "dark" ? "bg-black text-zinc-100" : "bg-white text-zinc-900",
    header: theme === "dark" ? "border-zinc-800 bg-black/80" : "border-zinc-200 bg-white/80",
    input: theme === "dark" ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus:border-white text-zinc-100" : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 focus:border-black text-zinc-900",
    btnPrimary: theme === "dark" ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800",
    btnSecondary: theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-250",
    card: theme === "dark" ? "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700" : "bg-zinc-50/50 border-zinc-200/80 hover:border-zinc-300",
    textMuted: theme === "dark" ? "text-zinc-400" : "text-zinc-500",
    borderMuted: theme === "dark" ? "border-zinc-800/50" : "border-zinc-200/50",
    codeBg: theme === "dark" ? "bg-zinc-950 border-zinc-900 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-900",
    preColor: theme === "dark" ? "text-zinc-300" : "text-zinc-700",
    loaderBorder: theme === "dark" ? "border-zinc-800" : "border-zinc-200",
    loaderSpinner: theme === "dark" ? "border-white" : "border-black",
    socialBtn: theme === "dark" ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300",
  };

  return (
    <div className={`min-h-screen ${styles.bg} transition-colors duration-300 flex flex-col font-sans relative`}>
      
      {/* Floating Top-Right Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer z-20 ${theme === "dark" ? "border-zinc-800 hover:bg-zinc-900 text-zinc-200" : "border-zinc-200 hover:bg-zinc-100 text-zinc-800"}`}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? "☼" : "☾"}
      </button>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        
        {/* Welcome State (Hero search input centered) */}
        {!posts.length && !loading && !error && (
          <div className="max-w-2xl mx-auto text-center py-20 animate-fadeIn">
            {/* Minimal Logo */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl border mx-auto mb-6 ${theme === "dark" ? "bg-white text-black border-white" : "bg-black text-white border-black"}`}>
              M
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Retrieve & API-fy any Medium Blog
            </h2>
            <p className={`${styles.textMuted} text-base mb-10 leading-relaxed max-w-md mx-auto`}>
              Enter a username below to scrape their entire historical archive, keep it synced, and generate a REST API.
            </p>
            
            {/* Centered Search Bar */}
            <form onSubmit={fetchPosts} className="flex max-w-md mx-auto gap-2 mb-16">
              <input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Medium username"
                className={`flex-1 px-4 py-2.5 rounded-xl focus:outline-none transition-all duration-300 text-sm border ${styles.input}`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-colors duration-300 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap ${styles.btnPrimary}`}
              >
                {loading ? "Fetching..." : "Fetch Blogs"}
              </button>
            </form>

            {/* Social Links & Attribution under Hero search bar */}
            <div className="mt-12 text-center animate-fadeIn">
              <p className={`text-xs font-semibold mb-4 tracking-wide ${styles.textMuted}`}>
                Developed by Aman Shahi
              </p>
              
              <div className="flex justify-center gap-3">
                {/* GitHub */}
                <a
                  href="https://github.com/aman-shahi-dev"
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${styles.socialBtn}`}
                  title="GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://x.com/TheBinaryCoder0"
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${styles.socialBtn}`}
                  title="Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Discord */}
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${styles.socialBtn}`}
                  title="Discord"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                  </svg>
                </a>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => window.open("https://github.com/aman-shahi-dev/medium-blogs-retriever-api", "_blank")}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer ${styles.socialBtn}`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>View Project on GitHub</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className={`absolute inset-0 rounded-full border-4 ${styles.loaderBorder}`}></div>
              <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${styles.loaderSpinner}`}></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fetching Medium Articles</h3>
            {isFirstScrape ? (
              <div className={`max-w-md border px-4 py-3 rounded-2xl text-xs animate-pulse leading-relaxed mx-auto ${theme === "dark" ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}>
                This is a new user.
              </div>
            ) : (
              <p className={`text-sm ${styles.textMuted}`}>Querying cache & database...</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto text-center py-10">
            <div className={`border p-6 rounded-2xl text-center my-6 ${theme === "dark" ? "bg-zinc-950 border-zinc-900 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"}`}>
              <span className="text-3xl mb-2 block">⚠️</span>
              <h3 className="font-bold mb-1">Retrieve Failed</h3>
              <p className={`text-xs mb-4 ${styles.textMuted}`}>{error}</p>
              <button
                onClick={() => setError("")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.btnPrimary}`}
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Results Page */}
        {posts.length > 0 && !loading && (
          <div className="animate-fadeIn">
            {/* Top Stat Row (with search integrated on the right) */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b ${styles.borderMuted}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] border ${theme === "dark" ? "bg-white text-black border-white" : "bg-black text-white border-black"}`}>
                    M
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${styles.textMuted}`}>Retriever API</span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">@{activeUsername}'s Articles</h2>
                <p className={`text-xs ${styles.textMuted}`}>Found {posts.length} articles accumulated in database</p>
              </div>

              {/* Search bar inside header when results are shown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <form onSubmit={fetchPosts} className="flex gap-2">
                  <input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Search username..."
                    className={`px-4 py-2 rounded-xl focus:outline-none transition-all duration-300 text-xs border ${styles.input} w-40 sm:w-48`}
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-300 text-xs ${styles.btnPrimary}`}
                  >
                    Fetch
                  </button>
                </form>
                
                {/* API URL Widget */}
                <div className={`border rounded-xl p-2.5 flex items-center gap-3 justify-between ${styles.codeBg}`}>
                  <code className="text-[11px] font-mono truncate max-w-[140px] sm:max-w-[200px]">
                    {getApiUrl()}
                  </code>
                  <button
                    onClick={() => copyCode(getApiUrl())}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${styles.btnPrimary}`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Layout of Post Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {posts.map((post, idx) => (
                <article
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group ${styles.card}`}
                >
                  <div className="flex flex-col">
                    {/* Thumbnail */}
                    <div className={`aspect-video w-full bg-zinc-950 overflow-hidden relative border-b ${styles.borderMuted}`}>
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-6 text-center">
                          <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest block select-none">
                            {post.categories[0] || "Medium Article"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-5">
                      {/* Meta info */}
                      <div className={`flex items-center gap-2 mb-2 text-[11px] font-semibold tracking-wide ${styles.textMuted}`}>
                        <span>{post.author}</span>
                        {post.pubDate && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(post.pubDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-bold text-current hover:underline line-clamp-2 text-base mb-3 leading-snug"
                      >
                        {post.title}
                      </a>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className={`text-xs line-clamp-3 leading-relaxed mb-4 ${styles.textMuted}`}>
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="px-5 pb-5">
                    {/* Tags List */}
                    {post.categories && post.categories.length > 0 && (
                      <div className={`flex flex-wrap gap-1.5 pt-3 pb-4 border-t ${styles.borderMuted}`}>
                        {post.categories.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-150 border-zinc-250 text-zinc-700"}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Read Action Button */}
                    <div className="mt-2">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className={`block w-full text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-300 cursor-pointer text-center ${styles.btnPrimary}`}
                      >
                        Read on Medium ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Developer Documentation Block */}
            <section className={`border rounded-3xl p-6 md:p-8 max-w-3xl mx-auto ${styles.card}`}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>💻</span> Developer Integration
              </h3>
              <p className={`text-xs mb-6 leading-relaxed ${styles.textMuted}`}>
                Integrating this retriever in other applications is simple. Fetch the endpoint using standard requests:
              </p>

              <div className={`rounded-2xl overflow-hidden border ${styles.codeBg}`}>
                <div className={`flex justify-between items-center px-4 py-2 border-b ${theme === "dark" ? "bg-zinc-900/50 border-zinc-900" : "bg-zinc-100 border-zinc-200"}`}>
                  <span className={`text-[11px] font-mono font-bold ${styles.textMuted}`}>JavaScript fetch()</span>
                  <button
                    onClick={() =>
                      copyCode(`fetch("${getApiUrl()}")
  .then(res => res.json())
  .then(data => console.log(data.posts));`)
                    }
                    className={`text-xs transition-colors font-medium hover:underline cursor-pointer ${styles.textMuted}`}
                  >
                    Copy Snippet
                  </button>
                </div>
                <pre className={`p-4 overflow-x-auto text-xs font-mono leading-relaxed ${styles.preColor}`}>
                  {`fetch("${getApiUrl()}")
  .then(res => res.json())
  .then(data => {
    console.log(\`Retrieved \${data.data.postCount} posts\`);
    console.log(data.data.posts);
  });`}
                </pre>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Dynamic styling for the customized thin, responsive scrollbar */}
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "#27272a" : "#d4d4d8"}; /* zinc-800 vs zinc-300 */
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "#3f3f46" : "#a1a1aa"}; /* zinc-700 vs zinc-400 */
        }
      `}</style>
    </div>
  );
};

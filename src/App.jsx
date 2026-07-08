import { useState, useEffect, useCallback, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@1,800;1,900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#020611;font-family:'Inter',sans-serif;color:#F8FAFC}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#020611}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.15)}
textarea,input,select,button{font-family:'Inter',sans-serif}
textarea:focus,input:focus,select:focus{outline:none}
a{text-decoration:none}
select{appearance:none;cursor:pointer}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{0%{transform:scale(0) rotate(-12deg);opacity:0}65%{transform:scale(1.2) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-400% 0}100%{background-position:400% 0}}
@keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,45,120,0.4)}50%{box-shadow:0 0 0 8px rgba(255,45,120,0)}}
@keyframes slideLeft{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes driftUp{
  0%{transform:translateY(0) scale(0.5);opacity:0}
  15%{opacity:1;transform:translateY(-15vh) scale(1.1) rotate(15deg)}
  50%{transform:translateY(-50vh) scale(1) rotate(-15deg)}
  85%{opacity:1}
  100%{transform:translateY(-105vh) scale(0.8) rotate(30deg);opacity:0}
}
.rm-fade{animation:fadeUp .32s cubic-bezier(.4,0,.2,1) both}
.rm-slide{animation:slideDown .24s cubic-bezier(.4,0,.2,1) both}
.rm-card{transition:transform .3s cubic-bezier(.34, 1.56, .64, 1),box-shadow .3s ease,background-color .3s ease,border-color .3s ease;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.rm-card:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 16px 36px rgba(0,0,0,0.45), 0 0 25px var(--ph-glow, rgba(124,58,237,0.15)), inset 0 1px 0 rgba(255,255,255,0.08);border-color:var(--ph-hover-border, rgba(255,255,255,0.15)) !important}
.rm-btn{transition:all .2s cubic-bezier(.4,0,.2,1);border:none;cursor:pointer}
.rm-btn:active{transform:scale(0.96)}
.rm-check{transition:all .2s cubic-bezier(.4,0,.2,1);cursor:pointer;user-select:none}
.rm-check:hover{transform:scale(1.08)}
.rm-tab{transition:all .2s ease;border:none;cursor:pointer;background:transparent;white-space:nowrap}
.shimmer{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.35) 50%,#fff 100%);background-size:400% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s ease infinite}
.mono{font-family:'JetBrains Mono',monospace!important}
.no-scrollbar::-webkit-scrollbar { display: none !important; }
.no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
`;

const PHASES = [
  {id:1,name:"PHASE I",full:"Computer Foundations",kanji:"基礎",months:[1,2,3,4],c:"#FF2D78",c2:"#FF8FB1",glow:"rgba(255,45,120,0.2)"},
  {id:2,name:"PHASE II",full:"Engineering Depth",kanji:"工学",months:[5,6,7,8],c:"#7C3AED",c2:"#A78BFA",glow:"rgba(124,58,237,0.2)"},
  {id:3,name:"PHASE III",full:"AI Systems Mastery",kanji:"知能",months:[9,10,11,12],c:"#F97316",c2:"#FBBF24",glow:"rgba(249,115,22,0.2)"}
];

const MONTHS = [
  {month:1,phase:1,title:"Linux & Computer Foundations",tag:"Linux · Git · Networking · Architecture",
   goal:"Operate at the system level — build genuine intuition about how computers work, not surface familiarity.",
   topics:[
    {name:"Computer Architecture",diff:"Critical",items:["CPU: registers, ALU, control unit, instruction cycle, clock speed","Cache hierarchy: L1/L2/L3, cache miss penalties, locality of reference","RAM, virtual memory, paging, page tables, TLB","SSD vs HDD, I/O bottlenecks, filesystem block structure"]},
    {name:"Operating Systems",diff:"Core",items:["Kernel vs user space, system call interface","Process lifecycle: fork, states (running/blocked/zombie), termination","Threads: user-level vs kernel-level, concurrency vs parallelism","Context switching, CPU scheduling: FCFS, SJF, Round-Robin","Memory management: segmentation, paging, demand paging","File system: inodes, directory structure, hard vs soft links, journaling"]},
    {name:"Linux Mastery",diff:"Must Own",items:["Filesystem hierarchy: /, /home, /etc, /var, /usr, /proc — know every dir","Core commands: ls, cd, pwd, mkdir, rm, cp, mv, touch, cat, less, head, tail","Permissions: chmod (octal + symbolic), chown, chgrp, sudo, setuid/setgid","Process management: ps, top, htop, kill, nice, jobs, fg, bg, nohup, lsof","Text manipulation: grep, sed, awk, cut, sort, uniq, wc, tr, xargs, tee","Network commands: curl, wget, ping, traceroute, ss, ssh, scp, rsync","Shell scripting: variables, $(), loops, conditionals, functions, exit codes","Package management: apt, dpkg — understand repositories and dependency resolution"]},
    {name:"Networking Foundations",diff:"Important",items:["OSI Model: all 7 layers with protocols and responsibilities","TCP/IP: 3-way handshake, 4-way teardown, congestion control","DNS: resolution chain, A/AAAA/CNAME/MX records, TTL, recursive vs authoritative","HTTP/HTTPS: methods, status codes, headers, CORS, cookies","SSL/TLS: certificate chain, handshake, symmetric vs asymmetric encryption","Ports and sockets: ephemeral ports, TCP vs UDP tradeoffs"]},
    {name:"Git (Full Mastery)",diff:"Must Own",items:["Git internals: .git/, objects/, refs/, HEAD, blobs, trees, commits as DAG","Core: clone, add, commit, push, pull, fetch, diff — understand each deeply","Branching: feature, release, hotfix patterns — a branch is just a pointer","Merge vs rebase: merge preserves history, rebase linearises — interactive rebase -i","Stash, cherry-pick, reset (--soft/--mixed/--hard), revert, reflog","Merge conflict resolution: conflict markers, theirs vs ours strategy","Fork workflow, pull requests, code review mechanics","Git hooks: pre-commit, pre-push — pre-commit framework","CODEOWNERS, branch protection rules, signed commits"]}
   ],
   parallel:"Set up GitHub profile with custom README. Daily commits. Read Linux man pages actively.",
   milestones:["Navigate entire Linux filesystem without GUI","Resolve merge conflicts independently","Explain TCP handshake + DNS resolution end to end"]},

  {month:2,phase:1,title:"Python Core",tag:"OOP · Functional · Advanced · Internals",
   goal:"Deeply understand Python — not syntax memorisation, but the language model and execution model underneath.",
   topics:[
    {name:"Core Python",diff:"Foundation",items:["Variables, scoping: LEGB rule (Local, Enclosing, Global, Built-in)","Mutability vs immutability: list vs tuple, implications for design","Data types: int (arbitrary precision), float (IEEE 754), str (unicode, immutable), bytes","Operators: arithmetic, comparison, logical (short-circuit), bitwise, walrus (:=)","Control flow: if/elif/else, for, while, break/continue/pass, else on loops","Functions: positional, keyword, *args, **kwargs, defaults (mutable default trap), closures"]},
    {name:"Data Structures",diff:"Core",items:["Lists: O(1) append, O(n) insert/delete, slicing, list comprehensions, nested","Tuples: immutability, packing/unpacking, namedtuple for readable structures","Sets: O(1) lookup, operations (union, intersection, diff), frozenset","Dicts: hash map underneath, dict comprehensions, insertion-order guarantee (3.7+)","collections: Counter, deque (O(1) both ends), defaultdict, OrderedDict, ChainMap"]},
    {name:"OOP (Deep)",diff:"Critical",items:["Classes: __init__, self, instance vs class variables, classmethods, staticmethods","Encapsulation: name mangling (__x), @property, getters/setters done right","Inheritance: single, multiple, MRO via C3 linearisation, super() mechanics","Polymorphism: method overriding, duck typing, protocols","Composition over inheritance: prefer has-a over is-a for flexibility","Abstract classes: abc.ABC, @abstractmethod — can not instantiate","Dunder methods: __repr__, __str__, __len__, __eq__, __hash__, __iter__, __enter__, __exit__"]},
    {name:"Advanced Python",diff:"Master",items:["Decorators: function/class decorators, factories, functools.wraps, stacking","Generators: yield, yield from, lazy evaluation, infinite sequences, pipelines","Iterators: __iter__, __next__, StopIteration, itertools (chain, islice, product)","Context managers: __enter__/__exit__, contextlib.contextmanager, suppress","Exception handling: try/except/else/finally, chaining, custom exception hierarchy","Logging: levels (DEBUG to CRITICAL), handlers, formatters, logger hierarchy"]},
    {name:"Python Internals",diff:"Deep",items:["GIL: one thread holds interpreter lock — threads not equal CPU parallelism","Reference counting: every object has refcount, cyclic GC for cycles","Memory model: id() = memory address, is vs == (identity vs equality), interning","Bytecode: compile(), dis module, .pyc files — what Python actually executes","Import system: sys.path, __init__.py, relative vs absolute, __all__, importlib"]}
   ],
   parallel:"30 to 40 easy LeetCode in Python. Daily practice files committed to GitHub.",
   milestones:["Write idiomatic Python with decorators, generators, context managers","Explain MRO and diamond problem clearly","Understand GIL — when threads help (I/O), when they don not (CPU)"]},

  {month:3,phase:1,title:"Advanced Python + Software Engineering",tag:"Testing · Async · Design Patterns · Packaging",
   goal:"Write production-quality, testable, typed, maintainable Python code like a senior engineer.",
   topics:[
    {name:"Type System",diff:"Important",items:["Type hints: basic (int, str, list[int]), complex (Union, Optional, Any, Literal)","Generic types: TypeVar, Generic[T], Callable[[int], str], Awaitable, TypedDict","Pydantic v2: BaseModel, Field, model_validator, field_validator, nested models","Static analysis: mypy (--strict mode), pyright — integrate into CI","Protocol-based structural typing: prefer over ABC for duck-typed type safety"]},
    {name:"Testing (Complete)",diff:"Must Own",items:["pytest: test discovery conventions, assertion rewriting, output capture","Fixtures: scope (function/class/module/session), yield fixtures, conftest.py","Parametrize: @pytest.mark.parametrize for data-driven tests","Mocking: unittest.mock.patch, MagicMock, AsyncMock, side_effect, spec=","Integration tests: test with real DB connections, testcontainers-python","Coverage: coverage.py, branch coverage, --fail-under threshold in CI","TDD: red-green-refactor cycle — write failing test first, always","Property-based testing: hypothesis — finds edge cases you never thought of"]},
    {name:"Packaging and Tooling",diff:"Core",items:["Virtual environments: venv, virtualenv — why isolation matters","pip: install, freeze, requirements.txt, extras [dev]","Poetry: pyproject.toml, dependency groups (main/dev/test), lock files","Module structure: packages, __init__.py, namespace packages, src/ layout","Makefile: build, test, lint, format, clean targets","pre-commit: hooks for black, isort, mypy, ruff — run on every commit"]},
    {name:"Async Programming",diff:"Critical",items:["Event loop: single thread, I/O multiplexing via epoll, cooperative multitasking","async/await: coroutines vs functions, await only inside async context","asyncio.gather() (concurrent), create_task() (fire-forget), wait()","Timeouts: asyncio.wait_for(), asyncio.timeout() (3.11+), cancellation","httpx (async HTTP), aiofiles (async file I/O)","CPU-bound: use multiprocessing or ProcessPoolExecutor, NOT async"]},
    {name:"Clean Code and Design Patterns",diff:"Master",items:["SOLID: SRP, OCP, LSP, ISP, DIP — understand each deeply with examples","DRY, KISS, YAGNI — and when to deliberately violate each","Code smells: long functions, god objects, feature envy, primitive obsession","Creational: Factory Method, Abstract Factory, Builder","Structural: Adapter, Decorator, Facade, Proxy","Behavioral: Observer, Strategy, Command, Template Method, Chain of Responsibility"]}
   ],
   parallel:"Contribute a documentation fix to a Python OSS project. Build a small tested, typed library.",
   milestones:["Write fully typed, tested, packaged Python library with CI","Write async REST client with retry logic and timeout","Apply 3+ design patterns correctly in a real codebase"]},

  {month:4,phase:1,title:"C Programming",tag:"Memory · Pointers · Processes · Systems",
   goal:"Understand the machine. This is the layer every abstraction runs on. Own it completely.",
   topics:[
    {name:"Memory Model",diff:"Critical",items:["Virtual address space: text (code), data (globals), BSS (uninit), heap up, stack down","Stack frames: local variables, return address, saved registers — draw one by hand","Heap: malloc uses sbrk/mmap under the hood, fragmentation, allocator overhead","Stack overflow: deep recursion, large local arrays — know the default limit (~8MB)","Memory-mapped files: mmap() — zero-copy I/O, shared memory between processes"]},
    {name:"Pointers (Own Completely)",diff:"Must Own",items:["Declaration, dereferencing (*ptr), address-of (&var) — draw box-and-arrow always","Pointer arithmetic: ptr+1 advances sizeof(*ptr) bytes, not 1","Array-pointer duality: array name decays to pointer to first element","Double pointers (**): modifying a pointer inside a function, 2D arrays","Function pointers: void (*fn)(int), callbacks, dispatch tables, qsort() comparator","const: const int* (data const), int* const (ptr const), const int* const (both)","void* pointers: generic programming, memcpy/memset, requires explicit cast"]},
    {name:"Memory Management",diff:"Critical",items:["malloc: uninitialized, returns void*, ALWAYS check for NULL","calloc: zero-initialized, count x size args (overflow-safe multiply)","realloc: resize or move, never overwrite original pointer with realloc return","free: pass only malloc'd ptrs, set to NULL after (dangling pointer prevention)","Valgrind --leak-check=full, AddressSanitizer (-fsanitize=address)","Buffer overflows: stack smashing, heap overflow — undefined behaviour + security hole","Use-after-free, double-free: undefined behaviour always"]},
    {name:"Data Structures in C",diff:"Core",items:["Strings: char array + null terminator, string.h: strcpy, strcat, strlen, strcmp, strstr","Structs: member access (. and ->), memory padding and alignment rules","Unions: all members share memory, type punning, sizeof = largest member","Implement from scratch: singly linked list, stack, queue, dynamic array — Valgrind-clean"]},
    {name:"Systems Programming",diff:"Deep",items:["fork(): creates child, returns PID in parent, 0 in child, -1 on error","exec() family: replaces process image — execvp(path, argv)","wait()/waitpid(): reap children, prevent zombie processes","Pipes: pipe(fd[2]), fd[0]=read, fd[1]=write — IPC between processes","Signals: signal(), sigaction(), SIGINT, SIGTERM, SIGCHLD, SIGSEGV","POSIX threads: pthread_create, pthread_join, pthread_detach","Mutex: pthread_mutex_lock/unlock — mutual exclusion for critical sections","Semaphores: sem_init, sem_wait (down), sem_post (up) — counting sync"]}
   ],
   parallel:"Build a simple shell in C (fork+exec+pipe). Continue easy-medium LeetCode. Daily commits.",
   milestones:["Write a Valgrind-clean linked list with all operations","Implement basic memory allocator from scratch","Explain call stack layout for recursive function with diagram"]},
  {month:5,phase:2,title:"C++ Modern + DSA Part 1",tag:"STL · Complexity · Arrays · Hashing · Binary Search",
   goal:"Enter interview-grade DSA. Build the algorithmic intuition that compounds for every problem after.",
   topics:[
    {name:"Modern C++",diff:"Core",items:["References: lvalue, rvalue, const references, reference collapsing","Smart pointers: unique_ptr (exclusive), shared_ptr (ref-counted), weak_ptr (non-owning)","RAII: tie resource lifetime to object lifetime — most important C++ idiom","Move semantics: std::move, rvalue references (&&), move constructor/assignment","Templates: function templates, class templates, template specialisation","Lambda: capture [=] value, [&] reference, mixed, mutable lambdas"]},
    {name:"C++ STL Complete",diff:"Must Own",items:["Sequence: vector (dynamic array), array (fixed), deque, list (bidirectional LL)","Ordered associative: map, multimap, set, multiset — BST, O(log n) all ops","Unordered: unordered_map, unordered_set — hash table, O(1) average","Adaptors: stack (LIFO), queue (FIFO), priority_queue (heap, max by default)","Algorithms: sort, stable_sort, binary_search, lower_bound, upper_bound, accumulate, next_permutation","Iterators: input, output, forward, bidirectional, random access"]},
    {name:"Complexity Analysis",diff:"Critical",items:["Big O (upper bound), Big Theta (tight), Big Omega (lower) — know all three","Common: O(1) hashmap, O(log n) binary search, O(n), O(n log n), O(n2), O(2n)","Space complexity: in-place O(1) vs auxiliary O(n) — both matter in interviews","Amortized: dynamic array doubling is O(1) amortized despite occasional O(n)","Master theorem: T(n) = aT(n/b) + f(n) — derive merge sort O(n log n)"]},
    {name:"Arrays, Strings and Hashing",diff:"Foundation",items:["Kadane's: max subarray sum, O(n) single pass","Array rotation: reversal algorithm — reverse all, reverse first k, reverse rest","Palindrome check: two-pointer inward, expand from centre","Hashing: collision handling, chaining vs open addressing, load factor + rehashing","Classic hash problems: two-sum, subarray sum = K, group anagrams, longest consecutive"]},
    {name:"Sorting and Binary Search",diff:"Must Own",items:["Merge sort: O(n log n) guaranteed, stable, O(n) extra space — divide-and-conquer","Quick sort: Lomuto/Hoare partition, avg O(n log n), worst O(n2) — random pivot","Counting sort, radix sort: O(n+k), non-comparison — know when applicable","Binary search template: while(lo<=hi), mid = lo+(hi-lo)/2 (overflow-safe)","Binary search on answer: monotone predicate, bisect answer space not array"]}
   ],
   parallel:"50-70 LeetCode: arrays, strings, hashing, binary search. GitHub Actions on all projects.",
   milestones:["Solve medium array/string problems without hints","Derive T(n) = 2T(n/2)+n = O(n log n) using master theorem","Implement merge sort + quick sort from memory"]},

  {month:6,phase:2,title:"DSA Part 2",tag:"Linked Lists · Trees · Heaps · Core Patterns",
   goal:"Master pointer-based structures and tree algorithms. Recognise the five core patterns on sight.",
   topics:[
    {name:"Linked Lists",diff:"Core",items:["Singly: insert (head/tail/middle), delete, traversal — draw every pointer change","Doubly: O(1) deletion given node reference (vs O(n) singly)","Circular: last node to head, traversal termination condition","Fast/slow pointers: cycle detection (Floyd's), find cycle entry, find middle O(1) space","Reversal: iterative (3 pointers), recursive — draw pointer state at each step","Patterns: merge sorted lists, merge K sorted lists, reverse K-group, LRU cache"]},
    {name:"Stacks and Queues",diff:"Important",items:["Monotonic stack: maintain increasing/decreasing invariant","Applications: next greater element, daily temperatures, largest rectangle in histogram","Circular queue: fixed-size ring buffer with head/tail pointers","Deque: sliding window maximum — O(n) overall using deque","Priority queue pattern: K largest elements, top K frequent elements"]},
    {name:"Trees Deep",diff:"Critical",items:["Traversals: inorder (LNR), preorder (NLR), postorder (LRN) — recursive + iterative with stack","Level order: BFS with queue, layer-by-layer collection","BST: insert, search, delete (3 cases: leaf, one child, two children via inorder successor)","Height, depth, diameter: understand the difference precisely","Balanced check: height diff <= 1 at every node via recursive postorder","LCA: naive O(h) parent-pointer walk","Construct from traversals: inorder+preorder, inorder+postorder"]},
    {name:"Heaps",diff:"Core",items:["Binary heap: complete binary tree + heap property, 0-indexed array representation","Heapify-up (insert O(log n)), heapify-down (extract O(log n))","Build heap from array: O(n) not O(n log n) — most nodes near leaves","K-th largest: min-heap of size K, swap if new element > root","Merge K sorted lists: min-heap with (value, list_idx, element_idx)"]},
    {name:"Core Patterns",diff:"Must Own",items:["Sliding window variable: longest substring up to K distinct chars, minimum window substring","Two pointers opposite ends: container with most water, trapping rain water, 3Sum","Prefix sum advanced: subarray sum = K (hashmap of cumulative sums)","Bit manipulation: XOR tricks (single number, missing number), Kernighan bit count, power of 2"]}
   ],
   parallel:"60-80 problems. Tree + heap + sliding window. Contribute a small feature to an OSS Python project.",
   milestones:["Implement BST with all operations including delete","Solve 5 different medium tree problems independently","Recognise sliding window variant within 30 seconds of reading"]},

  {month:7,phase:2,title:"DSA Part 3 + SQL",tag:"Graphs · DP · Backtracking · Database Mastery",
   goal:"Complete the DSA picture. Achieve full SQL mastery for any backend or data engineering role.",
   topics:[
    {name:"Graph Foundations",diff:"Critical",items:["Representations: adjacency matrix O(V2), adjacency list O(V+E), edge list","Types: directed, undirected, weighted, DAG, bipartite, connected components","BFS: queue-based, level traversal, shortest path in unweighted graph, 0-1 BFS","DFS: recursion/stack, connected components, cycle detection (white/grey/black colouring)","Topological sort: Kahn's (indegree BFS) and DFS-based — DAGs only","Bipartite check: 2-colouring via BFS"]},
    {name:"Shortest Path",diff:"Critical",items:["Dijkstra's: priority queue relaxation, O((V+E) log V) — non-negative weights only","Bellman-Ford: relax all edges V-1 times, detect negative cycle on V-th pass, O(VE)","Floyd-Warshall: all-pairs O(V3), dp[i][j][k] — can shorter path go through k?","When to use: unweighted to BFS, non-neg to Dijkstra, negative to Bellman-Ford, all-pairs to Floyd"]},
    {name:"MST and Union-Find",diff:"Core",items:["Kruskal's: sort edges by weight, union-find to avoid cycles — O(E log E)","Prim's: greedy grow from source using priority queue","Union-Find: union by rank + path compression — near-O(alpha(n)) per operation","Applications: connected components, cycle detection, network connectivity"]},
    {name:"Backtracking and Greedy",diff:"Important",items:["Framework: choose, explore, unchoose (state-space tree)","Permutations O(n!), combinations, subsets (power set)","N-Queens, Sudoku solver — constraint propagation pruning","Pruning: check constraints BEFORE recursing, not after","Greedy: activity selection, interval scheduling, jump game — prove with exchange argument"]},
    {name:"Dynamic Programming",diff:"Must Own",items:["Identify: overlapping subproblems + optimal substructure","Memoization top-down: add @lru_cache to naive recursion","Tabulation bottom-up: fill DP table, space-optimise to O(1) or O(n) where possible","1D DP: climbing stairs, house robber, jump game, coin change (min coins)","2D DP: unique paths, LCS, edit distance, LIS","0/1 Knapsack: for each item — include or exclude","Interval DP: matrix chain multiplication, burst balloons","DP on trees: max path sum, tree diameter via postorder DFS"]},
    {name:"SQL Mastery",diff:"Critical",items:["Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF — know which rows each returns","Aggregations: COUNT, SUM, AVG, MAX, MIN — GROUP BY, HAVING","Subqueries: scalar, correlated (runs per row), EXISTS/NOT EXISTS","Window functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD(n), LAG(n), FIRST_VALUE()","CTEs: WITH clause, recursive CTEs (UNION ALL) for hierarchy/tree queries","Transactions: ACID, isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE)","Indexes: B-tree internals, covering index, composite (prefix rule), partial index","Query optimisation: EXPLAIN ANALYZE — Seq Scan vs Index Scan vs Index Only Scan","Schema design: normalisation 1NF to 3NF to BCNF, when to deliberately denormalise"]}
   ],
   parallel:"Target 300+ cumulative LeetCode. SQL 50 on LeetCode. Read one system design deep-dive per week.",
   milestones:["Solve medium graph + DP problems without hints","Write recursive CTE for hierarchy traversal","Design normalised schema for a real-world app from scratch"]},

  {month:8,phase:2,title:"Backend Engineering + Databases",tag:"FastAPI · PostgreSQL · Redis · Auth · Architecture",
   goal:"Build production-grade backend systems with auth, caching, real databases, and proper architecture.",
   topics:[
    {name:"HTTP Deep Dive",diff:"Foundation",items:["Request lifecycle: DNS, TCP, TLS, HTTP request, response, teardown","Methods: GET (safe, idempotent), POST, PUT (idempotent), PATCH, DELETE, OPTIONS","Status codes: 200, 201, 204, 301, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503","Headers: Content-Type, Authorization (Bearer), Cache-Control, ETag, CORS","Cookies: HttpOnly (no JS), Secure (HTTPS only), SameSite (CSRF protection)","HTTP/2: multiplexing (no head-of-line blocking), header compression (HPACK)"]},
    {name:"FastAPI Deep",diff:"Core",items:["Routes: path/query/body params, response models, file uploads, Form data","Pydantic v2: request validation, response serialisation, response_model_exclude_unset","Dependency injection: Depends(), yield deps for DB sessions, global vs route scope","Async SQLAlchemy: AsyncSession, select statements, repository pattern","Middleware: logging, timing, CORS, trusted hosts","Lifespan events: startup (DB pool init), shutdown (graceful cleanup)","Exception handlers: HTTPException, RequestValidationError, custom hierarchy","API versioning: URL prefix (/api/v1/), include_router() organisation"]},
    {name:"Auth and Authorization",diff:"Critical",items:["JWT: header.payload.signature, HMAC (HS256) vs RSA (RS256), expiry","Refresh tokens: short-lived access (15min), long-lived refresh (7d), rotation on use","Store: refresh in HttpOnly secure cookie, access token in memory (never localStorage)","OAuth 2.0: auth code + PKCE (SPAs), client credentials (M2M), token exchange","Password hashing: bcrypt (adaptive, salt built-in), argon2 — NEVER MD5/SHA","RBAC: define roles, assign permissions, check in middleware"]},
    {name:"PostgreSQL Advanced",diff:"Critical",items:["Indexes: B-tree (default), hash (equality), GIN (JSONB/arrays), GiST (ranges/geo)","Covering index: INCLUDE columns — avoids heap lookup entirely","EXPLAIN ANALYZE: execution plans — Seq Scan vs Index Scan vs Index Only Scan","Isolation levels: READ COMMITTED (default), REPEATABLE READ, SERIALIZABLE","Row locking: SELECT ... FOR UPDATE (pessimistic), optimistic with version column","pgBouncer: session vs transaction mode — understand the difference","Alembic: autogenerate migrations, env.py, upgrade/downgrade, squash"]},
    {name:"Redis and Architecture",diff:"Core",items:["Data types: string, hash, list, set, sorted set, streams","Cache-aside: check, miss, query DB, populate + TTL","Rate limiting: sliding window with sorted set (ZADD + ZREMRANGEBYSCORE + ZCOUNT)","Distributed lock: SET key value EX ttl NX (atomic) — Redlock for multi-node","REST best practices: noun resources, idempotency keys, HATEOAS links","Pagination: cursor-based (keyset O(1)) vs offset (O(n)) — always prefer cursor","GraphQL: schema, resolvers, N+1 problem, DataLoader batching solution","Message queues: Kafka (partitioned log, replay), RabbitMQ (routing, exchanges)"]}
   ],
   parallel:"Deploy full auth-enabled API to AWS EC2/ECS. CI via GitHub Actions. Contribute to FastAPI or SQLAlchemy.",
   milestones:["Build production FastAPI app: JWT auth, PostgreSQL migrations, Redis caching","Explain OAuth 2.0 auth code + PKCE flow end to end","Prove index improvement with EXPLAIN ANALYZE before/after"]},
  {month:9,phase:3,title:"System Design + Cloud",tag:"Scalability · Docker · Kubernetes · AWS · Observability",
   goal:"Think at architectural scale. Understand how real distributed systems serve millions of users reliably.",
   topics:[
    {name:"Scalability",diff:"Critical",items:["Vertical vs horizontal scaling: limits, SPOF, stateless requirement","Load balancing: round-robin, least connections, consistent hashing ring","Reverse proxy: nginx (upstream blocks, proxy_pass, SSL termination)","CDN: edge caches, cache hit ratio, origin shield, cache invalidation strategies","Database read replicas: eventual consistency, replication lag, read-your-writes problem"]},
    {name:"Distributed Systems Theory",diff:"Critical",items:["CAP theorem: CP (PostgreSQL, ZooKeeper) vs AP (Cassandra, CouchDB)","PACELC: even without partition, choose Latency vs Consistency","Sharding: range-based (hot partitions risk), hash-based (uniform), directory-based","Consensus: Raft (leader election, log replication) — understand at concept level","Circuit breaker: closed, open, half-open — retry with exponential backoff + jitter","Idempotency: safe to retry — idempotency keys, at-least-once delivery semantics"]},
    {name:"Docker",diff:"Must Own",items:["Container internals: Linux namespaces (PID, net, mount, UTS, IPC), cgroups (resource limits)","Dockerfile: FROM, RUN, COPY, ADD, ENV, EXPOSE, CMD vs ENTRYPOINT — know the difference","Layer caching: order matters for build speed, .dockerignore is critical","Multi-stage builds: build stage (compiler) to runtime stage (minimal base) — tiny final image","Volumes: bind mount (host path), named volume (Docker-managed), tmpfs (in-memory)","Docker Compose: depends_on + healthcheck, env_file, profiles, networks"]},
    {name:"Kubernetes",diff:"Important",items:["Control plane: API server, etcd (state store), scheduler, controller manager","Worker node: kubelet, kube-proxy (iptables rules), container runtime (containerd)","Deployments: rolling update, rollback, maxSurge/maxUnavailable strategy","Services: ClusterIP, NodePort, LoadBalancer — when to use each","Ingress: path/host routing, TLS termination, nginx-ingress controller","ConfigMaps + Secrets: env vars vs volume mounts","HPA: auto-scale on CPU/memory/custom metrics — resource requests required"]},
    {name:"AWS Core",diff:"Core",items:["EC2: instance types (c=compute, r=memory, g=GPU), AMIs, security groups, user data","S3: versioning, presigned URLs, lifecycle policies, storage classes (Standard/IA/Glacier)","Lambda: cold starts, provisioned concurrency, concurrency limits, layers","IAM: least privilege, instance roles (no hardcoded keys), permission boundaries","VPC: public subnet (IGW route), private subnet (NAT), security groups vs NACLs","RDS: managed PG, multi-AZ, read replicas, parameter groups"]},
    {name:"Observability and CI/CD",diff:"Important",items:["Structured logging: JSON logs, correlation/trace ID in every line, log levels","Metrics: Prometheus scraping, counter/gauge/histogram/summary types","Distributed tracing: OpenTelemetry (vendor-neutral), spans, W3C traceparent propagation","GitHub Actions: triggers, matrix jobs, secrets, artifacts, reusable workflows","Deployment strategies: rolling (0 downtime), blue-green (instant cutover), canary (traffic split)"]}
   ],
   parallel:"Design YouTube + ChatGPT architecture on paper. Deploy containerised app to EKS/ECS. Full CI/CD.",
   milestones:["Design a 10M user system on whiteboard with full justifications","Deploy multi-service Docker Compose app behind nginx on AWS","Full CI/CD: lint, test, Docker build, push ECR, deploy"]},

  {month:10,phase:3,title:"Mathematics for AI + Machine Learning",tag:"Linear Algebra · Probability · Optimization · Classical ML",
   goal:"Build AI from mathematical foundations. Understand models deeply — not just how to call them.",
   topics:[
    {name:"Linear Algebra AI-Critical",diff:"Must Own",items:["Vectors: dot product = |a||b|cos(theta) to cosine similarity, norms (L1, L2, Lp)","Matrix multiplication: row x column, shape rules, non-commutative, cost O(n2 * m)","Linear transformations: rotation, scaling, projection, change of basis","Eigenvalues/vectors: Av = lambda * v, geometric meaning (scale without rotate), power iteration","SVD: A = U Sigma V-transpose — any matrix, applications in PCA, recommendation, compression","PCA via SVD: project onto top-k eigenvectors of covariance matrix","Tensors: generalisation (scalar=0D, vector=1D, matrix=2D), Einstein summation notation"]},
    {name:"Probability and Statistics",diff:"Critical",items:["Bayes theorem: P(A|B) = P(B|A) * P(A) / P(B) — posterior proportional to likelihood x prior","Distributions: Bernoulli, Binomial, Gaussian, Uniform, Poisson, Categorical, Dirichlet","Expectation, variance, covariance, correlation — compute from scratch","CLT: sample mean to Gaussian as n increases — explains why Gaussian appears everywhere","MLE: maximise log P(data|theta) — derive MLE for Gaussian to sample mean/variance","MAP estimation: MLE + prior = regularisation (L2 prior to Ridge regression)","A/B testing: sample size calculation, multiple testing correction (Bonferroni, FDR)"]},
    {name:"Information Theory AI-Critical",diff:"Deep",items:["Entropy: H(X) = -sum P(x) log2 P(x) — measure of uncertainty, bits needed","Cross-entropy: H(P,Q) = -sum P(x) log Q(x) — why it is the loss for classification","KL divergence: D_KL(P||Q) = sum P(x) log P(x)/Q(x) — non-symmetric, always >= 0","Mutual information: I(X;Y) = H(X) - H(X|Y) — how much X tells you about Y","Perplexity: exp(H) — LLM evaluation metric, lower = better"]},
    {name:"Optimization",diff:"Critical",items:["Gradient descent: theta update = theta - alpha * gradient of L — loss surface, learning rate effects","SGD vs mini-batch vs full-batch: stochasticity helps escape local minima","Convexity: bowl-shaped to global minimum guaranteed (logistic regression is convex)","Saddle points: more common than local minima in deep learning, gradient still escapes"]},
    {name:"Classical Machine Learning",diff:"Core",items:["Linear regression: OLS, gradient descent, L1 (Lasso/sparse), L2 (Ridge/shrink), Elastic Net","Logistic regression: sigmoid sigma(z), log-loss, softmax for multi-class","Random forest: bagging + feature subsetting, OOB error, permutation feature importance","Gradient boosting: additive model (each tree corrects residuals), XGBoost, LightGBM","K-Means: Lloyd's algorithm, inertia, elbow, K-Means++ initialisation","DBSCAN: epsilon-neighbourhood, minPts, core/border/noise — no K needed","Evaluation: Precision, Recall, F1, ROC-AUC, confusion matrix, bias-variance tradeoff","scikit-learn: Pipeline API, ColumnTransformer, cross_val_score, GridSearchCV"]}
   ],
   parallel:"Implement linear regression, logistic regression, K-means from scratch (NumPy only). Kaggle beginner competition.",
   milestones:["Implement gradient descent for logistic regression from scratch","Explain why cross-entropy works better than MSE for classification","Derive backpropagation for 2-layer network on paper"]},

  {month:11,phase:3,title:"Deep Learning + LLM Foundations",tag:"PyTorch · Transformers · Attention · Fine-Tuning",
   goal:"Become genuinely strong in deep learning. Understand LLMs from the architecture level upward.",
   topics:[
    {name:"Neural Networks",diff:"Foundation",items:["Perceptron: linear + threshold — XOR problem proves need for hidden layers","MLP: hidden layers, universal approximation theorem","Backpropagation: chain rule through computational graph, gradient = dLoss/dweight","Vanishing gradients: sigmoid saturates, near-zero gradients far from output","Weight init: Xavier/Glorot (tanh/sigmoid), He/Kaiming (ReLU) — keep activations in range","BatchNorm: normalise per mini-batch (x-mu)/sigma, learn gamma, beta — reduces covariate shift","LayerNorm: normalise per sample across features — preferred in Transformers"]},
    {name:"Optimizers and Training",diff:"Core",items:["SGD + momentum: velocity v = gamma*v + alpha * gradient, dampens oscillations in ravines","Adam: first moment m1 (momentum), second m2 (adaptive lr), bias correction, epsilon stability","AdamW: weight decay decoupled from gradient update — correct L2 regularisation","LR schedules: linear warmup (prevent early instability), cosine annealing (smooth decay)","Gradient clipping: clip by L2 norm — crucial for RNNs and Transformer training"]},
    {name:"CNN, RNN and Sequence Models",diff:"Important",items:["Convolution: kernel slides over input, weight sharing = translation equivariance","ResNet: F(x)+x skip connection allows gradients to flow unchanged into very deep networks","RNN: h_t = tanh(W_hh * h_{t-1} + W_xh * x_t) — vanishing gradient over 100+ steps","LSTM: input gate, forget gate, output gate, cell state highway","GRU: update + reset gates, fewer parameters than LSTM, similar performance","Why transformers replaced RNNs: parallelisable training + direct attention to any position"]},
    {name:"Attention and Transformers",diff:"Must Own",items:["Attention(Q,K,V) = softmax(QK-transpose / sqrt(d_k)) * V — scaled to prevent softmax saturation","Q = what I am looking for, K = what I advertise, V = what I provide if matched","Self-attention: Q=K=V from same sequence — every token attends to every other","Multi-head: h parallel heads, concatenate, project — different heads learn different patterns","Causal masking (decoder): upper triangular -inf mask, position i only attends to j <= i","Positional encoding: sinusoidal (absolute), RoPE (relative, rotates Q/K), ALiBi (bias on logits)","Transformer block (pre-norm): LayerNorm, MHA, residual, LayerNorm, FFN, residual","Scaling laws (Chinchilla): compute-optimal = equal params and tokens, ~20 tokens/param"]},
    {name:"PyTorch Deep",diff:"Must Own",items:["Tensors: creation, indexing, broadcasting, contiguous(), in-place ops","Autograd: computational graph, .backward(), .grad, torch.no_grad() for inference","nn.Module: __init__, forward, parameters(), register_buffer()","DataLoader: Dataset (__len__, __getitem__), collate_fn, num_workers, pin_memory","Training loop: zero_grad, forward, loss, backward, step — know why each step","Mixed precision: torch.cuda.amp.autocast(), GradScaler — 2x speedup with fp16","Checkpointing: save/load state_dict, optimizer state, epoch"]},
    {name:"LLM Internals",diff:"Deep",items:["Tokenization: BPE (merge most frequent pairs), WordPiece (BERT), SentencePiece, tiktoken","Vocabulary: special tokens [CLS]/[SEP] (BERT), bos/eos/pad (GPT), chat formats","Pre-training: causal LM (next token prediction), MLM (mask 15%, BERT-style)","LoRA: inject low-rank adapters W' = W0 + B*A (rank r << d) — only train A and B","QLoRA: quantise base to 4-bit NF4, attach LoRA in 16-bit — train 70B on consumer GPU","RLHF: SFT, reward model (preference pairs), PPO/DPO policy optimisation","Decoding: greedy, temperature (divide logits), top-k, top-p/nucleus, beam search"]}
   ],
   parallel:"Implement Attention Is All You Need from scratch. Fine-tune Llama/Mistral via QLoRA on custom dataset.",
   milestones:["Build + train mini-GPT character-level model in PyTorch from scratch","Fine-tune open LLM and evaluate on custom benchmark","Explain scaled dot-product attention on whiteboard without notes"]},

  {month:12,phase:3,title:"Advanced AI Engineering",tag:"RAG · Agents · MCP · Safety · Runtime Governance",
   goal:"Operate at the frontier. Build production AI systems and understand governance, safety, and the agent runtime layer.",
   topics:[
    {name:"RAG Systems Deep",diff:"Critical",items:["Embedding models: sentence-transformers, OpenAI text-embedding-3, BGE — benchmark on domain","Chunking: fixed-size, recursive character, semantic (sentence boundaries), late chunking","Dense retrieval: bi-encoder, cosine similarity — embed query, find nearest vectors","Sparse retrieval: BM25 (TF-IDF based), handles rare terms well","Hybrid search: RRF (Reciprocal Rank Fusion) — combine dense + sparse score lists","Re-ranking: cross-encoder (query+passage together to single score), BGE-reranker","Query transformation: HyDE (generate hypothetical answer, embed it), multi-query, step-back","Graph RAG: entity extraction, knowledge graph, community summaries","Agentic RAG: self-query, iterative retrieval, adaptive chunking strategies","Evaluation: RAGAs — faithfulness, answer relevance, context precision/recall"]},
    {name:"Vector Databases and Inference",diff:"Core",items:["HNSW: hierarchical navigable small world — multi-layer graph, O(log n) ANN search","FAISS: GPU-accelerated, IVF + PQ quantisation for billion-scale","Pinecone (managed), Weaviate (hybrid native), Chroma (local), Qdrant (Rust, filtering)","Quantisation: INT8, INT4, GPTQ, AWQ, GGUF (CPU-friendly portable format)","KV cache: key-value pairs cached per layer, PagedAttention (vLLM) manages fragmentation","Continuous batching: in-flight request processing — vLLM, TGI serving","Speculative decoding: draft model to verifier in parallel — latency reduction"]},
    {name:"Agent Systems Engineering",diff:"Critical",items:["Tool calling: function definitions (name, description, JSON schema), execution, result injection","ReAct framework: Reason (thought), Act (tool call), Observe (result), loop","Planning: hierarchical task decomposition, Tree-of-Thoughts (explore branches)","Memory: in-context (sliding window), external vector memory, episodic, semantic","Reflection: self-critique loop, error recovery — Reflexion paper significantly improves reliability","LangGraph: StateGraph, node=agent/tool, conditional edges, checkpointing for persistence","CrewAI: agents with roles+backstory, tasks, crew with sequential/hierarchical process","AutoGen: conversational multi-agent, GroupChat, human-in-the-loop, code execution","MCP (Model Context Protocol): server/client arch, tool/resource/prompt primitives","Multi-agent patterns: supervisor, peer-to-peer, blackboard (shared state)"]},
    {name:"AI Observability and Evaluation",diff:"Important",items:["LLMOps: model versioning, prompt versioning (treat prompts as code), A/B testing","Tracing: LangSmith, Langfuse, OpenTelemetry — trace every LLM call + tool + retrieval step","LLM-as-judge: use strong model to evaluate weak model output","Hallucination detection: NLI-based grounding (does claim follow context?), FactScore","Latency profiling: TTFT (time to first token), tokens/sec — profile before optimising"]},
    {name:"AI Safety and Alignment",diff:"Deep",items:["Alignment problem: reward hacking, Goodhart's law, goal misgeneralization, deceptive alignment","Constitutional AI (Anthropic): principle-based feedback to RLAIF","RLHF pipeline: SFT, RM (preference pairs, Bradley-Terry), PPO optimisation","DPO: direct preference optimisation — bypass RM, more stable than PPO","Robustness: adversarial prompts, distribution shift, OOD generalisation","Interpretability: probing classifiers, mechanistic interp — Anthropic circuits work","Red teaming: direct prompt injection, indirect injection, multi-turn escalation","Research orgs: Anthropic (Constitutional AI), OpenAI (RLHF, Superalignment), DeepMind (Scalable Oversight)"]},
    {name:"Agent Runtime Governance",diff:"Frontier",items:["The problem: agents access DBs, execute code, modify files — no governance layer yet","Execution tracing: every tool call logged with agent ID, parameters, result, trace ID","Permission systems: tool-level RBAC — which agent roles can invoke which tools","Policy engines: Open Policy Agent (OPA), Rego language — declarative, auditable policies","Sandboxing: E2B code interpreter, Docker-based execution isolation + network restriction","Anomaly detection: Shannon entropy H(X) on token distribution — injection shows as flat/spike","Human approval gates: interrupt agent for high-risk actions (delete ops, external sends)","MCP Security Proxy: intercept, verify, log all MCP tool calls at runtime","The emerging space: this layer does not exist at scale yet — exactly where infra companies emerge"]}
   ],
   parallel:"Ship production agent + RAG system on GitHub with CI/CD + docs + architecture diagram. Aggressive internship outreach.",
   milestones:["Ship production agent system with observability, evaluation pipeline, documentation","Contribute meaningful PR to LangChain, LlamaIndex, or CrewAI","Publish a technical blog post on a system you built from scratch"]}
];

const TRACKS=[
  {name:"DSA Practice",icon:"⚡",c:"#22D3EE",weekly:"5-8 hrs/wk",target:"300-500 problems",desc:"Pattern recognition over memorisation. Section-by-section, never random. Understand why the pattern works, not just that it does.",steps:["M1-2: Easy arrays, strings, hashing. Build speed and confidence","M3-4: Easy-medium mix. Introduce tree traversals early","M5-6: Medium primary. Sliding window, two pointers, BST, heaps","M7-8: Medium-hard. Graphs, DP, backtracking, greedy","M9-12: Hard patterns. Mock interviews. Timed Codeforces contests"]},
  {name:"Open Source",icon:"🔓",c:"#A78BFA",weekly:"3-5 hrs/wk",target:"50+ merged PRs",desc:"Communication matters as much as code. Ladder deliberately: typos, docs, bugs, features, maintainer. Discuss before coding always.",steps:["M1-2: Read large codebases. Fix typos and broken links","M3-4: Improve documentation, write setup/contribution guides","M5-6: Bug fixes from issue tracker. Discuss approach before submitting","M7-8: Add small features. Review others PRs. Become known","M9-12: Real features in Python/AI frameworks. Own a sub-area"]},
  {name:"GitHub and Portfolio",icon:"📁",c:"#34D399",weekly:"Daily",target:"1000+ commits, 5 flagships",desc:"Every repository is proof of skill. Professional READMEs, architecture diagrams, CI/CD, releases, tests. Recruiters spend 30-90 seconds per repo.",steps:["M1: Profile README, repository structure templates, learning logs","M2-3: Small utility projects — typed, tested, documented","M4-6: Project depth increases. GitHub Actions on everything","M7-9: Full-stack deployed projects. Architecture diagrams","M10-12: AI flagship projects. GitHub Pages portfolio site"]},
  {name:"Technical Reading",icon:"📖",c:"#FBBF24",weekly:"3 hrs/wk",target:"1 deep-dive/week",desc:"Build mental models, not just knowledge. DDIA (Kleppmann) is mandatory. Then arXiv papers weekly from Month 10.",steps:["M1-3: Stripe/Netflix/Cloudflare tech blogs. OSS documentation","M4-6: System design articles. Begin Designing Data-Intensive Applications","M7-9: Architecture papers. Complete DDIA. Database internals","M10-12: arXiv ML/AI/safety papers. Benchmark reports. Research blogs"]},
  {name:"Technical Writing",icon:"✍️",c:"#F87171",weekly:"1-2 hrs/wk",target:"10+ blog posts",desc:"Writing forces precision. Top engineers communicate clearly. If you cannot explain it, you do not fully understand it. Publish on Hashnode or dev.to.",steps:["M1-3: READMEs, setup guides, architecture decision records","M4-6: Technical breakdowns of things you built","M7-9: System design write-ups, tradeoff analysis posts","M10-12: Blog posts on RAG, agents, LLM internals, safety"]},
  {name:"AI Industry Awareness",icon:"🧠",c:"#EC4899",weekly:"2-3 hrs/wk",target:"Frontier-aware always",desc:"Know the ecosystem: models, frameworks, infra, startups, research. You are entering this industry — know the landscape from day one.",steps:["M1-6: AI landscape overview. What models exist. What is changing","M7-9: Infrastructure focus: inference, serving, orchestration","M10-12: Research papers: attention variants, agent frameworks, alignment"]}
];

const DIFF_C={"Critical":"#FF2D78","Must Own":"#FF2D78","Foundation":"#22D3EE","Core":"#94A3B8","Important":"#A78BFA","Deep":"#FBBF24","Frontier":"#F97316","Master":"#10B981"};

const DIFFS = ["All", "Critical", "Must Own", "Core", "Foundation", "Important", "Deep", "Master"];
const DOMAINS = ["All", "Systems", "Backend", "C / C++", "Algorithms & DSA", "Cloud & DevOps", "Mathematics & ML", "Deep Learning & LLMs", "AI Eng & Agents"];

const getTopicDomain = (topic, month) => {
  const t = topic.name.toLowerCase();
  if (t.includes("linux") || t.includes("operating system") || t.includes("systems programming") || t.includes("kernel") || t.includes("shell") || t.includes("memory model") || t.includes("networking") || t.includes("architecture")) {
    return "Systems";
  }
  if (t.includes("python") || t.includes("backend") || t.includes("fastapi") || t.includes("http") || t.includes("auth") || t.includes("sql") || t.includes("postgres") || t.includes("redis") || t.includes("django") || t.includes("flask") || t.includes("rest") || t.includes("graphql") || t.includes("message queue")) {
    return "Backend";
  }
  if (t.includes("c programming") || t.includes("c++") || t.includes("stl") || t.includes("pointer") || t.includes("memory management") || t.includes("raii")) {
    return "C / C++";
  }
  if (t.includes("linked list") || t.includes("stack") || t.includes("queue") || t.includes("tree") || t.includes("heap") || t.includes("graph") || t.includes("shortest path") || t.includes("mst") || t.includes("backtracking") || t.includes("greedy") || t.includes("dynamic programming") || t.includes("sort") || t.includes("binary search") || t.includes("complexity") || t.includes("array") || t.includes("string") || t.includes("hash") || t.includes("pattern")) {
    return "Algorithms & DSA";
  }
  if (t.includes("docker") || t.includes("kubernetes") || t.includes("aws") || t.includes("cloud") || t.includes("scalability") || t.includes("observability") || t.includes("ci/cd") || t.includes("distributed system") || t.includes("infrastructure") || t.includes("git")) {
    return "Cloud & DevOps";
  }
  if (t.includes("linear algebra") || t.includes("probability") || t.includes("statistics") || t.includes("information theory") || t.includes("optimization") || t.includes("mathematics") || t.includes("classical machine learning") || t.includes("gradient descent")) {
    return "Mathematics & ML";
  }
  if (t.includes("neural network") || t.includes("pytorch") || t.includes("deep learning") || t.includes("transformer") || t.includes("attention") || t.includes("llm internals") || t.includes("optimizer") || t.includes("cnn") || t.includes("rnn") || t.includes("sequence model")) {
    return "Deep Learning & LLMs";
  }
  if (t.includes("rag") || t.includes("agent") || t.includes("vector db") || t.includes("vector database") || t.includes("inference") || t.includes("mcp") || t.includes("prompt") || t.includes("observability and evaluation") || t.includes("security") || t.includes("governance")) {
    return "AI Eng & Agents";
  }
  if (month.month === 1 || month.month === 4) return "Systems";
  if (month.month === 2 || month.month === 3 || month.month === 8) return "Backend";
  if (month.month === 5 || month.month === 6 || month.month === 7) return "Algorithms & DSA";
  if (month.month === 9) return "Cloud & DevOps";
  if (month.month === 10) return "Mathematics & ML";
  if (month.month === 11) return "Deep Learning & LLMs";
  if (month.month === 12) return "AI Eng & Agents";
  return "Systems";
};
const RTYPES=[{v:"video",i:"🎬",l:"Video"},{v:"article",i:"📄",l:"Article"},{v:"docs",i:"📚",l:"Docs"},{v:"course",i:"🎓",l:"Course"},{v:"book",i:"📖",l:"Book"},{v:"github",i:"💻",l:"GitHub"},{v:"tool",i:"🔧",l:"Tool"},{v:"other",i:"🔗",l:"Other"}];
const BG="#020611",CARD="rgba(10, 25, 47, 0.45)",CARD2="rgba(16, 36, 66, 0.6)",BDR="rgba(255,255,255,0.07)",BDR2="rgba(255,255,255,0.12)",T1="#F8FAFC",T2="#CBD5E1",T3="#64748B";
const GLASS={backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)"};

const DEFAULT_RESOURCES = {
  1: [
    { id: 101, title: "The Linux Command Line", url: "https://linuxcommand.org/", type: "book", note: "An outstanding book to master the shell and system concepts." },
    { id: 102, title: "How DNS Works", url: "https://howdns.works/", type: "article", note: "An interactive, comic-style explanation of how DNS functions." },
    { id: 103, title: "Git Flight Rules", url: "https://github.com/k88hudson/git-flight-rules", type: "github", note: "A repository of rules for getting out of tricky Git states." }
  ],
  2: [
    { id: 201, title: "Fluent Python (2nd Edition)", url: "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", type: "book", note: "The definitive guide to writing idiomatic Python 3." },
    { id: 202, title: "Real Python Tutorials", url: "https://realpython.com/", type: "article", note: "High-quality, in-depth Python articles and video courses." },
    { id: 203, title: "Python LEGB Scoping Rule", url: "https://realpython.com/python-scope-legb-rule/", type: "article", note: "Deep dive into variable scopes in Python." }
  ],
  3: [
    { id: 301, title: "pytest Documentation", url: "https://docs.pytest.org/", type: "docs", note: "Official guide to using the powerful pytest testing framework." },
    { id: 302, title: "Refactoring.Guru: Design Patterns", url: "https://refactoring.guru/design-patterns", type: "docs", note: "Clean visual explanations of classic software design patterns." },
    { id: 303, title: "FastAPI Tutorial: User Guide", url: "https://fastapi.tiangolo.com/tutorial/", type: "docs", note: "Step-by-step documentation for backend APIs in Python." }
  ],
  4: [
    { id: 401, title: "C Programming Language (K&R)", url: "https://en.wikipedia.org/wiki/The_C_Programming_Language", type: "book", note: "The legendary foundation book written by Ritchie and Kernighan." },
    { id: 402, title: "Valgrind Quick Start Guide", url: "https://valgrind.org/docs/manual/quick-start.html", type: "docs", note: "Master debugging memory leaks and buffer overflows." },
    { id: 403, title: "mmap System Call Explanation", url: "https://man7.org/linux/man-pages/man2/mmap.2.html", type: "docs", note: "Official Linux manual page for zero-copy memory mapping." }
  ],
  5: [
    { id: 501, title: "LearnCpp.com Tutorials", url: "https://www.learncpp.com/", type: "course", note: "The absolute best free resource for learning modern C++." },
    { id: 502, title: "C++ Reference Documentation", url: "https://en.cppreference.com/", type: "docs", note: "Comprehensive reference wiki for standard C++ library." },
    { id: 503, title: "LeetCode: Fun with Arrays", url: "https://leetcode.com/explore/learn/card/fun-with-arrays/", type: "course", note: "Excellent starter card for basic array operations." }
  ],
  6: [
    { id: 601, title: "NeetCode.io Practice Roadmaps", url: "https://neetcode.io/", type: "course", note: "Structured list of curated LeetCode problems with video solutions." },
    { id: 602, title: "VisuAlgo: Visualise Data Structures", url: "https://visualgo.net/", type: "tool", note: "An interactive visualization of algorithms and data structures." },
    { id: 603, title: "Monotonic Stacks Explained", url: "https://leetcode.com/discuss/study-guide/2347639/A-comprehensive-guide-and-template-for-monotonic-stack-problems", type: "article", note: "Deep tutorial with templates and practice problems." }
  ],
  7: [
    { id: 701, title: "SQLZoo Interactive Tutorial", url: "https://sqlzoo.net/", type: "course", note: "Interactive SQL queries and practice tables in your browser." },
    { id: 702, title: "PostgreSQL Official Manual", url: "https://www.postgresql.org/docs/", type: "docs", note: "Complete documentation of Postgres internals and features." },
    { id: 703, title: "Dijkstra's Algorithm Visualised", url: "https://www.cs.usfca.edu/~galles/visualization/Dijkstra.html", type: "tool", note: "Excellent interactive pathfinding visualization." }
  ],
  8: [
    { id: 801, title: "Designing Data-Intensive Applications", url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781449373832/", type: "book", note: "Martin Kleppmann's masterpiece on modern distributed architectures." },
    { id: 802, title: "Redis University Courses", url: "https://university.redis.io/", type: "course", note: "Free official training for Redis caching, streams, and structures." },
    { id: 803, title: "Alembic Migrations Guide", url: "https://alembic.sqlalchemy.org/", type: "docs", note: "Official tutorial on managing database schema changes." }
  ],
  9: [
    { id: 901, title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "github", note: "An open-source goldmine for learning system design concepts." },
    { id: 902, title: "Docker Curriculum", url: "https://docker-curriculum.com/", type: "course", note: "A beginner-friendly tutorial for getting started with Docker." },
    { id: 903, title: "Kubernetes Interactive Tutorials", url: "https://kubernetes.io/docs/tutorials/", type: "course", note: "Official guides for understanding pods, deployments, and services." }
  ],
  10: [
    { id: 1001, title: "Mathematics for Machine Learning", url: "https://mml-book.github.io/", type: "book", note: "Complete textbook covering linear algebra, calculus, and stats." },
    { id: 1002, title: "3Blue1Brown: Essence of Linear Algebra", url: "https://www.3blue1brown.com/topics/linear-algebra", type: "video", note: "The most intuitive visual explanation of matrices on the internet." },
    { id: 1003, title: "Scikit-Learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "docs", note: "Official tutorials for linear models, trees, and pipelines." }
  ],
  11: [
    { id: 1101, title: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/", type: "docs", note: "Step-by-step guides for training deep learning models." },
    { id: 1102, title: "Fast.ai: Practical Deep Learning", url: "https://course.fast.ai/", type: "course", note: "Top-tier course focused on a top-down, code-first approach." },
    { id: 1103, title: "Andrej Karpathy: Zero to Hero LLM", url: "https://karpathy.ai/zero-to-hero.html", type: "video", note: "Outstanding lecture series on building GPT models from scratch." }
  ],
  12: [
    { id: 1201, title: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course/", type: "course", note: "Master pipelines, datasets, tokenizers, and model hub." },
    { id: 1202, title: "Pinecone Vector Database Handbook", url: "https://www.pinecone.io/learn/", type: "docs", note: "Excellent handbook on semantic search and embeddings." },
    { id: 1203, title: "LangChain Documentation", url: "https://python.langchain.com/docs/get_started/introduction", type: "docs", note: "The official guide to orchestrating LLM agents and tools." }
  ]
};

const ls={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

const getResources = (monthNum) => {
  const saved = ls.get(`rmx_res_${monthNum}`, null);
  if (saved !== null) return saved;
  return DEFAULT_RESOURCES[monthNum] || [];
};

const highlightText = (text, query, highlightColor = "#FF2D78") => {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const parts = text.split(new RegExp(`(${q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === q.toLowerCase() 
      ? <mark key={i} style={{ background: highlightColor + "40", color: highlightColor, borderRadius: "2px", padding: "0 2px" }}>{part}</mark>
      : part
  );
};

const totalItems=m=>m.topics.reduce((s,t)=>s+t.items.length,0);
const doneItems=(m,done)=>m.topics.reduce((s,t,ti)=>s+t.items.filter((_,ii)=>done[`m${m.month}_t${ti}_i${ii}`]).length,0);
const pct=(m,done)=>{const tot=totalItems(m);return tot?Math.round((doneItems(m,done)/tot)*100):0;};

function Md({text,color}){
  if(!text)return null;
  const inline=t=>{
    const parts=t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p,i)=>{
      if(p.startsWith('**')&&p.endsWith('**'))return <strong key={i} style={{color:T1}}>{p.slice(2,-2)}</strong>;
      if(p.startsWith('`')&&p.endsWith('`'))return <code key={i} className="mono" style={{background:"rgba(255,255,255,0.09)",padding:"1px 5px",borderRadius:"3px",fontSize:"10px",color:"#22D3EE"}}>{p.slice(1,-1)}</code>;
      return p;
    });
  };
  return(
    <div style={{lineHeight:1.65}}>
      {text.split('\n').map((ln,i)=>{
        if(ln.startsWith('# '))return <div key={i} style={{fontWeight:800,color:T1,fontSize:"13px",marginBottom:"7px",paddingBottom:"4px",borderBottom:`1px solid ${color}25`}}>{ln.slice(2)}</div>;
        if(ln.startsWith('## '))return <div key={i} style={{fontWeight:700,color,fontSize:"10px",marginBottom:"5px",textTransform:"uppercase",letterSpacing:"0.8px"}}>{ln.slice(3)}</div>;
        if(ln.startsWith('- '))return <div key={i} style={{display:"flex",gap:"8px",marginBottom:"4px",alignItems:"flex-start"}}><span style={{color,marginTop:"3px",flexShrink:0,fontSize:"9px"}}>▸</span><span style={{fontSize:"11px",color:T2}}>{inline(ln.slice(2))}</span></div>;
        if(ln.startsWith('> '))return <div key={i} style={{borderLeft:`2px solid ${color}`,paddingLeft:"10px",marginBottom:"6px",fontStyle:"italic",color:T3,fontSize:"11px"}}>{ln.slice(2)}</div>;
        if(ln.trim()==='')return <div key={i} style={{height:"6px"}}/>;
        return <div key={i} style={{fontSize:"11px",color:T2,marginBottom:"4px"}}>{inline(ln)}</div>;
      })}
    </div>
  );
}

function Ring({p,color,size=44,stroke=3.5}){
  const r=(size-stroke*2)/2,c=2*Math.PI*r,off=c-(p/100)*c;
  return(
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
  );
}

function BigRing({p,color,size=100}){
  const stroke=5,r=(size-stroke*2)/2,c=2*Math.PI*r,off=c-(p/100)*c;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{transition:"stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:"18px",fontWeight:"800",color:T1,lineHeight:1}}>{p}%</span>
      </div>
    </div>
  );
}

function CheatSheet({storeKey,color}){
  const [text,setText]=useState(()=>ls.get(`rmx_cs_${storeKey}`,""));
  const [editing,setEditing]=useState(false);
  const [saved,setSaved]=useState(true);
  const timer=useRef(null);
  const hasContent=text.trim().length>0;
  const onChange=v=>{setText(v);setSaved(false);clearTimeout(timer.current);timer.current=setTimeout(()=>{ls.set(`rmx_cs_${storeKey}`,v);setSaved(true);},700);};
  const save=()=>{ls.set(`rmx_cs_${storeKey}`,text);setSaved(true);setEditing(false);};
  const ph=`# Heading\n## Subheading\n- Key point with **bold** or \`code\`\n> Important insight\n\n## Formula / Steps\n- Step 1\n- Step 2`;
  return(
    <div style={{marginTop:"10px",background:"rgba(0,0,0,0.3)",border:`1px solid ${color}20`,borderRadius:"8px",padding:"11px",animation:"fadeIn .2s ease both"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"9px"}}>
        <span style={{fontSize:"10px",fontWeight:"700",color,letterSpacing:"1px"}}>
          📋 NOTES / CHEAT SHEET
          {saved&&hasContent&&<span style={{color:"#10B981",marginLeft:"7px",fontWeight:"600",letterSpacing:"0px"}}>✓ saved</span>}
          {!saved&&<span style={{color:"#FBBF24",marginLeft:"7px",fontWeight:"600",letterSpacing:"0px"}}>saving…</span>}
        </span>
        <div style={{display:"flex",gap:"5px"}}>
          {!editing&&<button className="rm-btn" onClick={()=>setEditing(true)} style={{padding:"3px 9px",borderRadius:"5px",background:`${color}14`,border:`1px solid ${color}30`,color,fontSize:"10px",fontWeight:"600"}}>{hasContent?"✏️ Edit":"+ Write"}</button>}
          {editing&&hasContent&&<button className="rm-btn" onClick={()=>setEditing(false)} style={{padding:"3px 9px",borderRadius:"5px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BDR2}`,color:T2,fontSize:"10px",fontWeight:"600"}}>👁 Preview</button>}
          {editing&&<button className="rm-btn" onClick={save} style={{padding:"3px 9px",borderRadius:"5px",background:`${color}18`,border:`1px solid ${color}38`,color,fontSize:"10px",fontWeight:"700"}}>💾 Save</button>}
          {hasContent&&!editing&&<button className="rm-btn" onClick={()=>{setText("");ls.set(`rmx_cs_${storeKey}`,"");}} style={{padding:"3px 7px",borderRadius:"5px",background:"transparent",border:`1px solid ${BDR}`,color:T3,fontSize:"10px"}}>✕</button>}
        </div>
      </div>
      {editing
        ?<textarea value={text} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={7}
            style={{width:"100%",background:"rgba(255,255,255,0.03)",border:`1px solid ${color}22`,borderRadius:"6px",padding:"9px 11px",color:T2,fontSize:"11px",lineHeight:1.7,resize:"vertical",fontFamily:"'JetBrains Mono',monospace"}}/>
        :hasContent
          ?<div style={{padding:"2px"}}><Md text={text} color={color}/></div>
          :<div style={{textAlign:"center",padding:"12px 0",color:T3,fontSize:"11px"}}>
              No notes yet — click <strong style={{color}}>+ Write</strong> to add a cheat sheet.<br/>
              <span style={{fontSize:"9px",opacity:.65}}>Supports **bold**, `code`, # headings, - bullets, {'>'} quotes</span>
            </div>
      }
      {editing&&text.trim()&&<div style={{textAlign:"right",marginTop:"4px",fontSize:"9px",color:T3}}>{text.trim().split(/\s+/).length} words</div>}
    </div>
  );
}

function Resources({monthNum,color}){
  const [items,setItems]=useState(()=>getResources(monthNum) );
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({title:"",url:"",type:"article",note:""});
  const [err,setErr]=useState("");
  const inp={width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${BDR2}`,borderRadius:"6px",padding:"7px 10px",color:T1,fontSize:"11px"};
  const add=()=>{
    if(!form.title.trim()){setErr("Title required");return;}
    if(!form.url.trim()||!form.url.startsWith("http")){setErr("Valid URL required (must start with http)");return;}
    const next=[...items,{...form,id:Date.now()}];
    setItems(next);ls.set(`rmx_res_${monthNum}`,next);
    setForm({title:"",url:"",type:"article",note:""});setAdding(false);setErr("");
  };
  const remove=id=>{const next=items.filter(r=>r.id!==id);setItems(next);ls.set(`rmx_res_${monthNum}`,next);};
  return(
    <div style={{marginTop:"12px",background:"rgba(0,0,0,0.22)",border:`1px solid rgba(255,255,255,0.07)`,borderRadius:"10px",padding:"13px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"11px"}}>
        <span style={{fontSize:"10px",fontWeight:"700",color,letterSpacing:"1px"}}>
          📚 RESOURCES {items.length>0&&<span style={{marginLeft:"4px",background:`${color}14`,padding:"1px 6px",borderRadius:"4px",color,border:`1px solid ${color}28`,fontSize:"9px"}}>{items.length}</span>}
        </span>
        <button className="rm-btn" onClick={()=>{setAdding(!adding);setErr("");}} style={{padding:"4px 10px",borderRadius:"6px",background:adding?`${color}18`:"rgba(255,255,255,0.04)",border:`1px solid ${adding?color+"38":BDR2}`,color:adding?color:T2,fontSize:"10px",fontWeight:"600"}}>
          {adding?"✕ Cancel":"+ Add Link"}
        </button>
      </div>
      {adding&&(
        <div className="rm-slide" style={{background:CARD,border:`1px solid ${color}22`,borderRadius:"8px",padding:"11px",marginBottom:"11px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"7px"}}>
            <input style={inp} placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input style={inp} placeholder="URL (https://...)" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"7px",marginBottom:"7px"}}>
            <select style={{...inp,cursor:"pointer"}} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {RTYPES.map(t=><option key={t.v} value={t.v}>{t.i} {t.l}</option>)}
            </select>
            <input style={inp} placeholder="Note (optional)" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
          </div>
          {err&&<div style={{fontSize:"10px",color:"#FF2D78",marginBottom:"7px"}}>⚠ {err}</div>}
          <button className="rm-btn" onClick={add} style={{padding:"6px 16px",borderRadius:"6px",background:`${color}18`,border:`1px solid ${color}38`,color,fontSize:"11px",fontWeight:"700"}}>Add Resource</button>
        </div>
      )}
      {items.length>0
        ?<div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
          {items.map(r=>{
            const rt=RTYPES.find(t=>t.v===r.type)||RTYPES[7];
            return(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 9px",background:"rgba(255,255,255,0.02)",border:`1px solid ${BDR}`,borderRadius:"6px"}}>
                <span style={{fontSize:"13px",flexShrink:0}}>{rt.i}</span>
                <div style={{flex:1,minWidth:0}}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{color:T1,fontSize:"12px",fontWeight:"600",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                    onMouseEnter={e=>e.target.style.color=color} onMouseLeave={e=>e.target.style.color=T1}>
                    {r.title} ↗
                  </a>
                  {r.note&&<div style={{fontSize:"9px",color:T3,marginTop:"1px"}}>{r.note}</div>}
                </div>
                <span style={{fontSize:"8px",padding:"2px 6px",background:`${color}0D`,border:`1px solid ${color}22`,borderRadius:"3px",color,fontWeight:"600",flexShrink:0}}>{rt.l}</span>
                <button className="rm-btn" onClick={()=>remove(r.id)} style={{padding:"2px 5px",borderRadius:"4px",background:"transparent",border:"none",color:T3,fontSize:"11px"}}>🗑</button>
              </div>
            );
          })}
        </div>
        :!adding&&<div style={{textAlign:"center",padding:"8px 0",color:T3,fontSize:"10px"}}>Add links to articles, videos, docs, courses...</div>
      }
    </div>
  );
}

function Pomodoro(){
  const [open,setOpen]=useState(false);
  const [left,setLeft]=useState(25*60);
  const [running,setRunning]=useState(false);
  const [isBreak,setIsBreak]=useState(false);
  const iRef=useRef(null);
  useEffect(()=>{
    if(running){iRef.current=setInterval(()=>setLeft(p=>{if(p<=1){clearInterval(iRef.current);setRunning(false);const nb=!isBreak;setIsBreak(nb);return nb?5*60:25*60;}return p-1;}),1000);}
    else clearInterval(iRef.current);
    return()=>clearInterval(iRef.current);
  },[running,isBreak]);
  const m=Math.floor(left/60),s=left%60;
  const totalSecs=isBreak?5*60:25*60;
  const prog=Math.round(((totalSecs-left)/totalSecs)*100);
  const ac=isBreak?"#10B981":"#FF2D78";
  return(
    <div style={{position:"fixed",bottom:"20px",right:"20px",zIndex:500}}>
      {open?(
        <div style={{background:"#0A1628",border:`1px solid ${ac}35`,borderRadius:"14px",padding:"16px 18px",width:"156px",boxShadow:`0 0 24px ${ac}22`,animation:"popIn .2s ease both"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"11px"}}>
            <span style={{fontSize:"10px",color:ac,fontWeight:"700",letterSpacing:"1px"}}>{isBreak?"☕ BREAK":"🎯 FOCUS"}</span>
            <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",color:T3,fontSize:"12px",cursor:"pointer"}}>✕</button>
          </div>
          <div style={{position:"relative",display:"flex",justifyContent:"center",marginBottom:"12px"}}>
            <Ring p={prog} color={ac} size={78} stroke={5}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="mono" style={{fontSize:"18px",fontWeight:"700",color:T1}}>{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:"6px",justifyContent:"center"}}>
            <button className="rm-btn" onClick={()=>setRunning(!running)} style={{padding:"6px 14px",borderRadius:"7px",background:`${ac}18`,border:`1px solid ${ac}38`,color:ac,fontSize:"15px",fontWeight:"700"}}>{running?"⏸":"▶"}</button>
            <button className="rm-btn" onClick={()=>{setRunning(false);setLeft(25*60);setIsBreak(false);}} style={{padding:"6px 10px",borderRadius:"7px",background:"rgba(255,255,255,0.04)",border:`1px solid ${BDR2}`,color:T2,fontSize:"12px"}}>↺</button>
          </div>
          <div style={{textAlign:"center",marginTop:"8px",fontSize:"9px",color:T3}}>25 min focus · 5 min break</div>
        </div>
      ):(
        <button onClick={()=>setOpen(true)} style={{width:"42px",height:"42px",borderRadius:"50%",background:running?"rgba(255,45,120,0.15)":"rgba(10,22,40,0.9)",border:`1px solid ${running?"#FF2D78":"rgba(255,255,255,0.12)"}`,color:running?"#FF2D78":T3,fontSize:"18px",cursor:"pointer",animation:running?"timerPulse 2s ease infinite":"none",transition:"all .2s ease"}}>⏱</button>
      )}
    </div>
  );
}

function CelebrationOverlay({ active }) {
  if (!active) return null;
  
  // Create an array of 45 particles with random positions, delays, emojis
  const particles = Array.from({ length: 45 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 3.0;
    const size = Math.random() * 14 + 14;
    const emoji = ["✨", "🎉", "⭐", "💫", "🏆", "🌸", "🚀"][Math.floor(Math.random() * 7)];
    const duration = Math.random() * 1.5 + 2.0; // 2s to 3.5s
    return { id: i, left, delay, size, emoji, duration };
  });

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999, overflow: "hidden" }}>
      {particles.map(p => (
        <span key={p.id} style={{
          position: "absolute",
          left: `${p.left}%`,
          bottom: "-15%",
          fontSize: `${p.size}px`,
          pointerEvents: "none",
          animation: `driftUp ${p.duration}s cubic-bezier(0.1, 0.8, 0.3, 1) both`,
          animationDelay: `${p.delay}s`,
        }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function RoadmapChart({ done }) {
  const data = MONTHS.map(m => ({
    name: `M${m.month}`,
    title: m.title,
    progress: pct(m, done)
  }));

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BDR}`,
      borderRadius: "16px",
      padding: "20px",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
    }}>
      <div style={{ fontSize: "11px", color: T3, fontWeight: "800", letterSpacing: "1.5px", marginBottom: "16px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>📈 PROGRESS CHART</span>
        <span style={{ color: "#22D3EE", fontSize: "10px", fontWeight: "700" }}>By Module</span>
      </div>
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke={T3} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={T3} fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "rgba(10, 22, 40, 0.95)", border: `1px solid ${BDR}`, borderRadius: "10px", fontSize: "11.5px", color: T1, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
              itemStyle={{ color: "#22D3EE", padding: 0 }}
              labelStyle={{ fontWeight: "bold", color: T1, marginBottom: "4px" }}
              formatter={(value) => [`${value}%`, "Completed"]}
              labelFormatter={(label, items) => {
                const item = items[0]?.payload;
                return item ? `${label}: ${item.title}` : label;
              }}
            />
            <Area type="monotone" dataKey="progress" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#chartColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ModuleNoteDrawer({ activeMonth, onClose, onSave }) {
  const [text, setText] = useState("");
  
  useEffect(() => {
    if (activeMonth) {
      const saved = ls.get(`rmx_module_notes_${activeMonth}`, "");
      setText(saved);
    }
  }, [activeMonth]);

  if (!activeMonth) return null;

  const monthData = MONTHS.find(m => m.month === activeMonth);
  if (!monthData) return null;
  const ph = PHASES[monthData.phase - 1];

  const handleSave = (val) => {
    const clean = val.slice(0, 200);
    setText(clean);
    ls.set(`rmx_module_notes_${activeMonth}`, clean);
    if (onSave) onSave();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      display: "flex",
      justifyContent: "flex-end",
      background: "rgba(2, 6, 17, 0.6)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      animation: "fadeIn 0.25s ease both"
    }} onClick={onClose}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        height: "100%",
        background: "rgba(10, 22, 40, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderLeft: `1px solid ${ph.c}30`,
        boxShadow: `-10px 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        animation: "slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        position: "relative"
      }} onClick={e => e.stopPropagation()}>
        {/* Glowing top line matching Phase color */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${ph.c}, ${ph.c2})`,
          boxShadow: `0 2px 10px ${ph.c}`
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10px", color: ph.c, fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase" }}>
              {ph.name} · MODULE {activeMonth}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: T1, fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginTop: "4px" }}>
              {monthData.title}
            </div>
          </div>
          <button onClick={onClose} className="rm-btn" style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${BDR}`,
            color: T2,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}>✕</button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: T2, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>✍️</span> Personal Notes
            </span>
            <span style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              color: text.length >= 180 ? "#FF2D78" : (text.length >= 140 ? "#FBBF24" : ph.c),
              fontWeight: "600"
            }}>
              {text.length} / 200
            </span>
          </div>
          
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={text}
              onChange={e => handleSave(e.target.value)}
              placeholder="Jot down brief takeaways, resources, commands, or personal goals for this module..."
              maxLength={200}
              style={{
                width: "100%",
                flex: 1,
                background: "rgba(5, 14, 30, 0.6)",
                border: `1px solid ${text.length > 0 ? ph.c + "50" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px",
                padding: "16px",
                color: T1,
                fontSize: "12.5px",
                lineHeight: "1.7",
                resize: "none",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: text.length > 0 ? `inset 0 0 10px ${ph.c}0b` : "none"
              }}
              onFocus={e => e.target.style.borderColor = ph.c}
              onBlur={e => e.target.style.borderColor = text.length > 0 ? ph.c + "50" : "rgba(255,255,255,0.1)"}
            />
            
            {text.length === 200 && (
              <div style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                fontSize: "9px",
                background: "rgba(255,45,120,0.15)",
                color: "#FF2D78",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid rgba(255,45,120,0.3)",
                fontWeight: "700",
                animation: "popIn 0.2s ease"
              }}>
                Character limit reached
              </div>
            )}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${BDR}`,
            borderRadius: "10px",
            padding: "12px 14px"
          }}>
            <div style={{ fontSize: "9px", color: T3, fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
              💡 Persistence Note
            </div>
            <div style={{ fontSize: "10.5px", color: T2, lineHeight: "1.5" }}>
              These notes are locally secured on your device and will load instantly whenever you review this module.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rm-btn"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${ph.c}, ${ph.c2})`,
            color: T1,
            fontWeight: "800",
            fontSize: "12px",
            boxShadow: `0 4px 15px ${ph.c}33`,
            cursor: "pointer",
            textAlign: "center"
          }}
        >
          ✓ Close & Keep Note
        </button>
      </div>
    </div>
  );
}

export default function App(){
  useEffect(()=>{
    if(document.getElementById("rmx-css"))return;
    const el=document.createElement("style");el.id="rmx-css";el.textContent=CSS;
    document.head.appendChild(el);
  },[]);

  const [done,setDone]=useState(()=>ls.get("rmx_done",{}));
  const [bkm,setBkm]=useState(()=>ls.get("rmx_bkm",{}));
  const [exp,setExp]=useState(null);
  const [tab,setTab]=useState("roadmap");
  const [trkExp,setTrkExp]=useState(null);
  const [confetti,setConfetti]=useState(null);
  const [noteOpen,setNoteOpen]=useState({});
  const [csOpen,setCsOpen]=useState({});
  const [resOpen,setResOpen]=useState({});
  const [weekFocus,setWeekFocus]=useState(()=>ls.get("rmx_wfocus",""));
  const [libTab,setLibTab]=useState("notes");
  const [phaseFilter,setPhaseFilter]=useState(0);
  const [searchQuery,setSearchQuery]=useState("");
  const [selectedDiff, setSelectedDiff] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [activeNoteMonth, setActiveNoteMonth] = useState(null);
  const [syncState, setSyncState] = useState("saved"); // "saving" | "saved"

  const isFirstRender = useRef(true);

  const triggerSaveSync = useCallback(() => {
    setSyncState("saving");
    const t = setTimeout(() => {
      setSyncState("saved");
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const matchesSearch = useCallback((month, query) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    if (month.title.toLowerCase().includes(q) || 
        month.tag.toLowerCase().includes(q) || 
        month.goal.toLowerCase().includes(q)) {
      return true;
    }
    return month.topics.some(t => 
      t.name.toLowerCase().includes(q) || 
      t.items.some(item => item.toLowerCase().includes(q))
    );
  }, []);

  const toggleDone=useCallback((key,mn)=>{
    setDone(prev=>{
      const next={...prev,[key]:!prev[key]};ls.set("rmx_done",next);
      const m=MONTHS.find(x=>x.month===mn);
      if(m&&!prev[key]){const nc=Object.keys(next).filter(k=>k.startsWith(`m${mn}_`)&&next[k]).length;if(nc===totalItems(m))setConfetti(mn);}
      return next;
    });
  },[]);
  const toggleTopicDone = useCallback((mn, ti, topic) => {
    setDone(prev => {
      const isComp = topic.items.every((_, ii) => prev[`m${mn}_t${ti}_i${ii}`]);
      const next = { ...prev };
      topic.items.forEach((_, ii) => {
        const key = `m${mn}_t${ti}_i${ii}`;
        if (isComp) {
          delete next[key];
        } else {
          next[key] = true;
        }
      });
      ls.set("rmx_done", next);
      const m = MONTHS.find(x => x.month === mn);
      if (m && !isComp) {
        const nc = Object.keys(next).filter(k => k.startsWith(`m${mn}_`) && next[k]).length;
        if (nc === totalItems(m)) {
          setConfetti(mn);
        }
      }
      return next;
    });
  }, []);
  const markAll=useCallback(mn=>{
    const m=MONTHS.find(x=>x.month===mn);
    setDone(prev=>{const next={...prev};m.topics.forEach((t,ti)=>t.items.forEach((_,ii)=>{next[`m${mn}_t${ti}_i${ii}`]=true;}));ls.set("rmx_done",next);setConfetti(mn);return next;});
  },[]);
  const resetMonth=useCallback(mn=>{
    const m=MONTHS.find(x=>x.month===mn);
    setDone(prev=>{const next={...prev};m.topics.forEach((t,ti)=>t.items.forEach((_,ii)=>{delete next[`m${mn}_t${ti}_i${ii}`];}));ls.set("rmx_done",next);return next;});
  },[]);
  const toggleBkm=useCallback(mn=>{setBkm(prev=>{const next={...prev,[mn]:!prev[mn]};ls.set("rmx_bkm",next);return next;});},[] );
  
  useEffect(()=>{if(confetti!=null){const t=setTimeout(()=>setConfetti(null),3500);return()=>clearTimeout(t);}},[confetti]);
  
  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    setSyncState("saving");
    const t = setTimeout(() => {
      setSyncState("saved");
    }, 700);
    return () => clearTimeout(t);
  }, [done]);

  useEffect(() => {
    ls.set("rmx_wfocus", weekFocus);
    if (isFirstRender.current) {
      return;
    }
    setSyncState("saving");
    const t = setTimeout(() => {
      setSyncState("saved");
    }, 700);
    return () => clearTimeout(t);
  }, [weekFocus]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const allItems=MONTHS.reduce((s,m)=>s+totalItems(m),0);
  const allDone=MONTHS.reduce((s,m)=>s+doneItems(m,done),0);
  const totalPct=Math.round((allDone/allItems)*100);
  const phasePct=p=>{const ms=MONTHS.filter(m=>m.phase===p);const tot=ms.reduce((s,m)=>s+totalItems(m),0);const dn=ms.reduce((s,m)=>s+doneItems(m,done),0);return tot?Math.round((dn/tot)*100):0;};
  const compMonths=MONTHS.filter(m=>pct(m,done)===100).length;
  const ts=k=>({
    padding:"8px 16px",
    borderRadius:"20px",
    color:tab===k?T1:T2,
    fontSize:"11.5px",
    fontWeight:tab===k?"700":"500",
    letterSpacing:"0.3px",
    background:tab===k?"rgba(255, 255, 255, 0.08)":"transparent",
    border:`1px solid ${tab===k?"rgba(255,255,255,0.15)":"transparent"}`,
    boxShadow:tab===k?"0 4px 12px rgba(0, 0, 0, 0.25)":"none",
    backdropFilter:tab===k?"blur(10px)":"none",
    WebkitBackdropFilter:tab===k?"blur(10px)":"none",
    transition:"all .25s cubic-bezier(0.4, 0, 0.2, 1)",
    marginRight:"4px",
    marginBottom:"6px",
    display:"flex",
    alignItems:"center",
    gap:"6px",
    cursor:"pointer"
  });

  return(
    <div style={{background:BG,minHeight:"100vh",position:"relative",overflowX:"hidden"}}>
      {/* Premium Floating Ambient Background Glows */}
      <div style={{position:"fixed",top:"-10%",left:"-10%",width:"45%",height:"45%",background:"radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(90px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"10%",right:"-10%",width:"55%",height:"55%",background:"radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(110px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:"45%",right:"15%",width:"35%",height:"35%",background:"radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(90px)",pointerEvents:"none",zIndex:0}}/>

      {confetti!=null&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"rgba(10, 22, 40, 0.8)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:"18px",padding:"28px 44px",textAlign:"center",animation:"popIn .35s cubic-bezier(.4,0,.2,1) both",border:"1px solid rgba(16,245,160,0.35)"}}>
            <div style={{fontSize:"44px",marginBottom:"10px"}}>🎉</div>
            <div style={{fontSize:"18px",fontWeight:"800",color:"#10F5A0",marginBottom:"3px"}}>Month {confetti} Complete!</div>
            <div style={{fontSize:"12px",color:T2}}>Outstanding. Keep the momentum going.</div>
          </div>
        </div>
      )}

      {/* Redesigned Premium Responsive Layout */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 relative z-10">
        
        {/* Left Column (Premium Dashboard Control Sidebar) */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)] lg:overflow-y-auto no-scrollbar">
          {/* Brand Logo Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 36, 66, 0.45), rgba(10, 22, 40, 0.25))",
            border: `1.5px solid rgba(255, 255, 255, 0.08)`,
            borderRadius: "16px",
            padding: "24px",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              fontSize: "32px",
              fontWeight: "900",
              fontStyle: "italic",
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #FFFFFF, #A78BFA, #FF2D78)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
              userSelect: "none"
            }}>
              Flow 16
            </div>
            <div style={{ fontSize: "10px", color: T3, letterSpacing: "1.5px", marginTop: "6px", fontWeight: "700" }}>
              SYSTEMS & AI ARCHITECT ROADMAP
            </div>
          </div>

          {/* This Week's Focus - integrated directly into Sidebar as a sacred focal point! */}
          <div style={{
            background: CARD,
            border: `1px solid ${BDR}`,
            borderRadius: "16px",
            padding: "20px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}>
            <div style={{ fontSize: "10px", color: "#22D3EE", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🎯</span> WEEK'S SACRED FOCUS
            </div>
            <textarea 
              value={weekFocus} 
              onChange={e => setWeekFocus(e.target.value)}
              placeholder="What are you studying this week? e.g. Month 3 testing + async..."
              rows={3} 
              style={{
                width: "100%",
                background: "rgba(5, 14, 30, 0.45)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 12px",
                color: T2,
                fontSize: "11px",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#22D3EE"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Recharts Progress Visualization Chart */}
          <RoadmapChart done={done} />
        </aside>

        {/* Right Column (Main View Panel) */}
        <main className="space-y-6">
          {/* Header Action & Tab Bar (Glassmorphic) */}
          <div style={{
            background: "rgba(10, 22, 40, 0.55)",
            border: `1px solid ${BDR}`,
            borderRadius: "18px",
            padding: "16px 20px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "sticky",
            top: "16px",
            zIndex: 100,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            {/* Search Input Bar */}
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: T3 }}>🔍</span>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search topics, modules, tools, concepts, or resources... (e.g., 'Python', 'mmap', 'git')" 
                style={{
                  width: "100%",
                  background: "rgba(5, 14, 30, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "10px 16px 10px 36px",
                  color: T1,
                  fontSize: "12.5px",
                  outline: "none",
                  transition: "all 0.25s"
                }}
                onFocus={e => e.target.style.borderColor = "#7C3AED"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: T3,
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tab selection buttons with cloud sync status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "6px", overflowX: "auto" }} className="no-scrollbar">
                {[["roadmap","🗺 Roadmap"], ["library","📚 Library"], ["tracks","⚡ Tracks"], ["progress","📊 Progress"]].map(([k,l])=>(
                  <button key={k} className="rm-tab" onClick={()=>setTab(k)} style={ts(k)}>{l}</button>
                ))}
              </div>
              
              {/* Cloud Sync Simulator indicator */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                color: syncState === "saving" ? "#A78BFA" : "#10F5A0",
                fontWeight: "700",
                letterSpacing: "0.2px",
                transition: "all 0.3s ease",
                boxShadow: syncState === "saving" ? "0 0 12px rgba(167,139,250,0.15)" : "none"
              }}>
                {syncState === "saving" ? (
                  <>
                    <span style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#A78BFA",
                      boxShadow: "0 0 8px #A78BFA"
                    }} />
                    <span>Syncing cloud...</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "12px", color: "#10F5A0" }}>☁️</span>
                    <span>All changes saved</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active View Container */}
          <div style={{ animation: "fadeIn .3s ease both" }}>

        {tab==="roadmap"&&(
          <div>
            {/* Horizontally Scrollable Category & Difficulty Filters with Glassmorphism */}
            <div style={{background:"rgba(10, 25, 47, 0.22)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${BDR}`, borderRadius:"12px", padding:"12px 14px", marginBottom:"18px", boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                {/* Difficulty Filter */}
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                    <span style={{fontSize:"9.5px", color:T3, fontWeight:"800", letterSpacing:"1.2px", textTransform:"uppercase"}}>Filter by Difficulty</span>
                    {selectedDiff !== "All" && (
                      <button onClick={() => setSelectedDiff("All")} style={{background:"none", border:"none", color:"#FF2D78", fontSize:"9.5px", fontWeight:"700", cursor:"pointer"}}>Clear</button>
                    )}
                  </div>
                  <div style={{display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"2px"}} className="no-scrollbar">
                    {DIFFS.map(d => {
                      const active = selectedDiff === d;
                      const count = MONTHS.flatMap(m => m.topics).filter(t => d === "All" || t.diff === d).length;
                      return (
                        <button key={d} className="rm-btn" onClick={() => setSelectedDiff(d)}
                          style={{
                            padding:"5px 11px",
                            borderRadius:"20px",
                            fontSize:"10px",
                            fontWeight:"700",
                            whiteSpace:"nowrap",
                            background: active ? "linear-gradient(135deg, #FF2D78, #7C3AED)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${active ? "#FF2D78" : BDR}`,
                            color: active ? T1 : T2,
                            transition: "all 0.2s"
                          }}>
                          {d === "All" ? "🔥 All Levels" : d} <span style={{fontSize:"8.5px", opacity: active ? 0.9 : 0.6, marginLeft:"3px"}}>({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Domain Filter */}
                <div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                    <span style={{fontSize:"9.5px", color:T3, fontWeight:"800", letterSpacing:"1.2px", textTransform:"uppercase"}}>Filter by Technology Domain</span>
                    {selectedDomain !== "All" && (
                      <button onClick={() => setSelectedDomain("All")} style={{background:"none", border:"none", color:"#22D3EE", fontSize:"9.5px", fontWeight:"700", cursor:"pointer"}}>Clear</button>
                    )}
                  </div>
                  <div style={{display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"2px"}} className="no-scrollbar">
                    {DOMAINS.map(dom => {
                      const active = selectedDomain === dom;
                      const count = MONTHS.flatMap(m => m.topics.map(t => ({ t, m }))).filter(({ t, m }) => dom === "All" || getTopicDomain(t, m) === dom).length;
                      return (
                        <button key={dom} className="rm-btn" onClick={() => setSelectedDomain(dom)}
                          style={{
                            padding:"5px 11px",
                            borderRadius:"20px",
                            fontSize:"10px",
                            fontWeight:"700",
                            whiteSpace:"nowrap",
                            background: active ? "linear-gradient(135deg, #7C3AED, #22D3EE)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${active ? "#7C3AED" : BDR}`,
                            color: active ? T1 : T2,
                            transition: "all 0.2s"
                          }}>
                          {dom === "All" ? "💻 All Domains" : dom} <span style={{fontSize:"8.5px", opacity: active ? 0.9 : 0.6, marginLeft:"3px"}}>({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {PHASES.map(phase=>(
              <div key={phase.id} style={{marginBottom:"28px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"13px",padding:"13px 16px",background:`${phase.c}07`,border:`1px solid ${phase.c}18`,borderRadius:"11px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",right:"-6px",top:"-16px",fontSize:"86px",fontWeight:"900",color:`${phase.c}05`,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>{phase.kanji}</div>
                  <div style={{width:"3px",height:"38px",background:`linear-gradient(180deg,${phase.c},${phase.c2})`,borderRadius:"2px",boxShadow:`0 0 10px ${phase.c}80`,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"9px",color:phase.c,letterSpacing:"2.5px",fontWeight:"700",textTransform:"uppercase"}}>{phase.name}</div>
                    <div style={{fontSize:"15px",fontWeight:"800",color:T1,letterSpacing:"-0.3px"}}>{phase.full}</div>
                    <div style={{fontSize:"9px",color:T3,marginTop:"1px"}}>Months {phase.months[0]}–{phase.months[3]}</div>
                  </div>
                  <BigRing p={phasePct(phase.id)} color={phase.c} size={58}/>
                </div>

                {MONTHS.filter(m=>m.phase===phase.id).map((month,idx)=>{
                  const isMatch = matchesSearch(month, searchQuery);
                  if (!isMatch) return null;

                  const hasMatchingTopics = month.topics.some(topic => {
                    const matchesDiff = selectedDiff === "All" || topic.diff === selectedDiff;
                    const matchesDom = selectedDomain === "All" || getTopicDomain(topic, month) === selectedDomain;
                    return matchesDiff && matchesDom;
                  });
                  if (!hasMatchingTopics) return null;

                  const isExp = exp === month.month || (searchQuery.trim() !== "" && isMatch) || (selectedDiff !== "All" || selectedDomain !== "All");
                  const p=pct(month,done);
                  const ph=PHASES[month.phase-1];
                  const isBkm=bkm[month.month];
                  const comp=doneItems(month,done),tot=totalItems(month);
                  return(
                    <div key={month.month} style={{marginBottom:isExp?"0":"7px",animation:`fadeUp .28s ease ${idx*.05}s both`}}>
                      <div className="rm-card" style={{background:isExp?CARD2:CARD,border:`1px solid ${isExp?ph.c+"45":BDR}`,borderRadius:isExp?"11px 11px 0 0":"11px",padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",position:"relative",overflow:"hidden",boxShadow:isExp?`0 0 18px ${ph.glow}`:"none",transition:"all .22s ease"}} onClick={()=>setExp(isExp?null:month.month)}>
                        <div style={{position:"absolute",right:"10px",top:"-10px",fontSize:"72px",fontWeight:"900",color:`${ph.c}04`,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>{String(month.month).padStart(2,"0")}</div>
                        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"3px",background:`linear-gradient(180deg,${ph.c},${ph.c2})`,borderRadius:"11px 0 0 11px",boxShadow:isExp?`2px 0 8px ${ph.c}50`:"none",transition:"box-shadow .25s"}}/>
                        <div style={{width:"34px",height:"34px",borderRadius:"8px",background:`${ph.c}14`,border:`1px solid ${ph.c}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"800",color:ph.c,flexShrink:0,marginLeft:"7px",zIndex:1}}>{String(month.month).padStart(2,"0")}</div>
                        <div style={{flex:1,minWidth:0,zIndex:1}}>
                           <div style={{fontSize:"12px",fontWeight:"700",color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                            {highlightText(month.title, searchQuery, ph.c)}
                            {isBkm&&<span style={{marginLeft:"5px",fontSize:"11px"}}>⭐</span>}
                            {p===100&&<span style={{marginLeft:"5px",fontSize:"9px",background:"rgba(16,245,160,0.1)",color:"#10F5A0",padding:"1px 5px",borderRadius:"3px",border:"1px solid rgba(16,245,160,0.22)",fontWeight:"700"}}>✓ DONE</span>}
                          </div>
                          <div style={{fontSize:"9px",color:T3,marginTop:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{highlightText(month.tag, searchQuery, ph.c)}</div>
                          <div style={{height:"2px",background:"rgba(255,255,255,0.04)",borderRadius:"1px",marginTop:"6px",overflow:"hidden",width:"100px"}}>
                            <div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${ph.c},${ph.c2})`,transition:"width .8s ease"}}/>
                          </div>
                        </div>
                        <div style={{position:"relative",zIndex:1,flexShrink:0}}>
                          <Ring p={p} color={ph.c} size={40} stroke={3.5}/>
                          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:"700",color:p>0?ph.c:T3}}>{p}%</div>
                        </div>
                        <div style={{display:"flex",gap:"2px",zIndex:1}} onClick={e=>e.stopPropagation()}>
                          <button className="rm-btn" onClick={()=>toggleBkm(month.month)} style={{padding:"3px 5px",borderRadius:"4px",background:"transparent",border:"none",color:isBkm?"#FBBF24":T3,fontSize:"13px"}}>{isBkm?"★":"☆"}</button>
                          <div style={{color:isExp?ph.c:T3,fontSize:"9px",padding:"4px",transition:"transform .2s",transform:isExp?"rotate(180deg)":"none"}}>▼</div>
                        </div>
                      </div>
 
                      {isExp&&(
                        <div className="rm-slide" style={{background:"rgba(5,14,30,0.97)",backdropFilter:"blur(20px)",border:`1px solid ${ph.c}28`,borderTop:"none",borderRadius:"0 0 11px 11px",padding:"16px 16px 18px",boxShadow:`0 8px 28px ${ph.glow}`}}>
                          <div style={{background:`${ph.c}08`,border:`1px solid ${ph.c}20`,borderRadius:"9px",padding:"11px 13px",marginBottom:"14px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                            <span style={{fontSize:"15px",flexShrink:0,marginTop:"1px"}}>🎯</span>
                            <div>
                              <div style={{fontSize:"9px",letterSpacing:"1.5px",color:ph.c,fontWeight:"700",marginBottom:"3px",textTransform:"uppercase"}}>Monthly Goal</div>
                              <div style={{fontSize:"12px",color:"#CBD5E1",lineHeight:1.7}}>{highlightText(month.goal, searchQuery, ph.c)}</div>
                            </div>
                          </div>
                          <div style={{display:"flex",gap:"6px",marginBottom:"13px",flexWrap:"wrap",alignItems:"center"}}>
                            <div style={{fontSize:"10px",color:T3}}><span style={{color:ph.c,fontWeight:"700"}}>{comp}</span>/{tot} done</div>
                            <div style={{flex:1}}/>
                            <button className="rm-btn" onClick={()=>setActiveNoteMonth(month.month)} style={{padding:"4px 10px",borderRadius:"5px",border:`1px solid ${BDR2}`,background:"rgba(255,255,255,0.03)",color:T1,fontSize:"9px",fontWeight:"700",display:"flex",alignItems:"center",gap:"4px"}}>📝 Personal Notes</button>
                            <button className="rm-btn" onClick={()=>setResOpen(p=>({...p,[month.month]:!p[month.month]}))} style={{padding:"3px 9px",borderRadius:"5px",border:`1px solid ${ph.c}30`,background:`${ph.c}0C`,color:ph.c,fontSize:"9px",fontWeight:"600"}}>📚 Resources</button>
                            <button className="rm-btn" onClick={()=>markAll(month.month)} style={{padding:"3px 9px",borderRadius:"5px",border:`1px solid ${ph.c}38`,background:`${ph.c}12`,color:ph.c,fontSize:"9px",fontWeight:"700"}}>✓ Mark All</button>
                            <button className="rm-btn" onClick={()=>resetMonth(month.month)} style={{padding:"3px 7px",borderRadius:"5px",border:`1px solid ${BDR}`,background:"transparent",color:T3,fontSize:"9px"}}>↺ Reset</button>
                          </div>

                          {/* Beautiful hand-written note preview */}
                          {(() => {
                            const note = ls.get(`rmx_module_notes_${month.month}`, "");
                            if (!note) return null;
                            return (
                              <div onClick={() => setActiveNoteMonth(month.month)} style={{
                                background: "rgba(255,255,255,0.01)",
                                border: `1.5px dashed ${ph.c}40`,
                                borderRadius: "10px",
                                padding: "12px 14px",
                                marginBottom: "14px",
                                fontSize: "12px",
                                color: T2,
                                lineHeight: "1.6",
                                cursor: "pointer",
                                position: "relative",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                transition: "all 0.25s ease",
                                boxShadow: `inset 0 0 12px ${ph.c}05`
                              }} className="hover:border-indigo-400 group">
                                <span style={{ fontSize: "16px", marginTop: "-1px" }}>✍️</span>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: "800", color: ph.c, fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>MODULE MEMO</span>
                                  <span className="italic" style={{ color: T1 }}>"{note}"</span>
                                </div>
                                <span style={{ fontSize: "10px", color: T3, alignSelf: "center" }}>Edit ✎</span>
                              </div>
                            );
                          })()}
                          {resOpen[month.month]&&<Resources monthNum={month.month} color={ph.c}/>}
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"7px",marginBottom:"9px"}}>
                            {month.topics.map((topic,ti)=>{
                              const matchesDiff = selectedDiff === "All" || topic.diff === selectedDiff;
                              const matchesDom = selectedDomain === "All" || getTopicDomain(topic, month) === selectedDomain;
                              if (!matchesDiff || !matchesDom) return null;

                              const isTopicMatch = !searchQuery.trim() || 
                                topic.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
                                topic.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                              if (!isTopicMatch) return null;

                              const topDone=topic.items.filter((_,ii)=>done[`m${month.month}_t${ti}_i${ii}`]).length;
                              const isAllDone = topDone === topic.items.length;
                              const isPartDone = topDone > 0 && topDone < topic.items.length;
                              const dc=DIFF_C[topic.diff]||T3;
                              const csKey=`${month.month}_${ti}`;
                              const csIsOpen=csOpen[csKey];
                              return(
                                <div key={ti} style={{background:CARD,border:`1px solid ${isAllDone ? ph.c + "33" : BDR}`,borderRadius:"9px",padding:"12px",position:"relative",overflow:"visible",transition:"border-color 0.2s"}}>
                                  <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"rgba(255,255,255,0.04)",borderRadius:"9px 9px 0 0"}}>
                                    <div style={{height:"100%",width:`${(topDone/topic.items.length)*100}%`,background:`linear-gradient(90deg,${ph.c},${ph.c2})`,transition:"width .6s ease"}}/>
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px",marginTop:"3px"}}>
                                    {/* Interactive Topic Checkbox */}
                                    <div onClick={(e)=>{e.stopPropagation(); toggleTopicDone(month.month, ti, topic);}}
                                      style={{
                                        width:"14px",
                                        height:"14px",
                                        borderRadius:"4px",
                                        flexShrink:0,
                                        border:`1.5px solid ${isAllDone ? ph.c : (isPartDone ? `${ph.c}95` : "rgba(255,255,255,0.22)")}`,
                                        background:isAllDone ? `${ph.c}20` : (isPartDone ? `${ph.c}0E` : "transparent"),
                                        display:"flex",
                                        alignItems:"center",
                                        justifyContent:"center",
                                        cursor:"pointer",
                                        transition:"all .2s ease",
                                      }}
                                      className="rm-check"
                                      title={isAllDone ? "Reset whole topic" : "Mark whole topic as completed"}>
                                      {isAllDone && <span style={{fontSize:"9px",color:ph.c,fontWeight:"bold",lineHeight:1}}>✓</span>}
                                      {isPartDone && <div style={{width:"5px",height:"1.5px",background:ph.c,borderRadius:"1px"}}/>}
                                    </div>

                                    <div style={{flex:1,fontSize:"10px",fontWeight:"700",color:ph.c,textTransform:"uppercase",letterSpacing:"0.4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{highlightText(topic.name, searchQuery, ph.c)}</div>
                                    <span style={{fontSize:"7px",fontWeight:"700",color:dc,padding:"1px 5px",background:`${dc}0E`,borderRadius:"3px",border:`1px solid ${dc}22`,letterSpacing:"0.3px",flexShrink:0}}>{topic.diff}</span>
                                    <span style={{fontSize:"8px",color:topDone===topic.items.length?"#10B981":T3,fontWeight:"600",flexShrink:0}}>{topDone}/{topic.items.length}</span>
                                    <button className="rm-btn" onClick={()=>setCsOpen(p=>({...p,[csKey]:!p[csKey]}))}
                                      style={{padding:"2px 6px",borderRadius:"4px",background:csIsOpen?`${ph.c}14`:"rgba(255,255,255,0.04)",border:`1px solid ${csIsOpen?ph.c+"38":BDR}`,color:csIsOpen?ph.c:T3,fontSize:"9px",fontWeight:"600",flexShrink:0}}>
                                      {csIsOpen?"▲":"📋"}
                                    </button>
                                  </div>
                                  {topic.items.map((item,ii)=>{
                                    const isItemMatch = !searchQuery.trim() || 
                                      item.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                                      topic.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
                                    if (!isItemMatch) return null;
                                    const k=`m${month.month}_t${ti}_i${ii}`;
                                    const isDone=done[k];
                                    return(
                                      <div key={ii} className="rm-check" style={{display:"flex",gap:"7px",alignItems:"flex-start",marginBottom:"6px"}} onClick={()=>toggleDone(k,month.month)}>
                                        <div style={{width:"13px",height:"13px",borderRadius:"3px",flexShrink:0,marginTop:"3px",border:`1.5px solid ${isDone?ph.c:"rgba(255,255,255,0.12)"}`,background:isDone?`${ph.c}20`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s ease"}}>
                                          {isDone&&<span style={{fontSize:"8px",color:ph.c,animation:"popIn .2s ease both"}}>✓</span>}
                                        </div>
                                        <span style={{fontSize:"10px",lineHeight:1.6,color:isDone?"rgba(255,255,255,0.2)":T2,textDecoration:isDone?"line-through":"none",transition:"all .18s ease"}}>{highlightText(item, searchQuery, ph.c)}</span>
                                      </div>
                                    );
                                  })}
                                  {csIsOpen&&<CheatSheet storeKey={csKey} color={ph.c}/>}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
                            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"8px",padding:"11px 12px"}}>
                              <div style={{fontSize:"9px",letterSpacing:"1.5px",color:T3,fontWeight:"700",marginBottom:"7px",textTransform:"uppercase"}}>⚡ Parallel This Month</div>
                              <div style={{fontSize:"11px",color:T2,lineHeight:1.65}}>{month.parallel}</div>
                            </div>
                            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"8px",padding:"11px 12px"}}>
                              <div style={{fontSize:"9px",letterSpacing:"1.5px",color:T3,fontWeight:"700",marginBottom:"7px",textTransform:"uppercase"}}>🏆 Milestones</div>
                              {month.milestones.map((ml,i)=>(
                                <div key={i} style={{display:"flex",gap:"6px",alignItems:"flex-start",marginBottom:"6px"}}>
                                  <span style={{color:ph.c,fontSize:"9px",marginTop:"3px",flexShrink:0}}>✓</span>
                                  <span style={{fontSize:"10px",color:T2,lineHeight:1.55}}>{ml}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {tab==="library"&&(
          <div className="rm-fade">
            <div style={{display:"flex",gap:"5px",marginBottom:"16px",background:CARD,border:`1px solid ${BDR}`,borderRadius:"9px",padding:"4px"}}>
              {[["notes","📋 Cheat Sheets"],["resources","📚 Resources"]].map(([k,l])=>(
                <button key={k} className="rm-btn" onClick={()=>setLibTab(k)} style={{flex:1,padding:"7px 10px",borderRadius:"7px",background:libTab===k?"rgba(255,255,255,0.07)":"transparent",border:"none",color:libTab===k?T1:T3,fontSize:"11px",fontWeight:libTab===k?"700":"500",transition:"all .18s"}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:"5px",marginBottom:"14px",flexWrap:"wrap"}}>
              {[[0,"All"],...PHASES.map(p=>[p.id,p.name])].map(([v,l])=>(
                <button key={v} className="rm-btn" onClick={()=>setPhaseFilter(v)} style={{padding:"4px 10px",borderRadius:"5px",border:`1px solid ${phaseFilter===v?(v>0?PHASES[v-1].c+"55":BDR2):BDR}`,background:phaseFilter===v?(v>0?`${PHASES[v-1].c}12`:"rgba(255,255,255,0.06)"):"transparent",color:phaseFilter===v?(v>0?PHASES[v-1].c:T1):T3,fontSize:"10px",fontWeight:"600"}}>{l}</button>
              ))}
            </div>
            {libTab==="notes"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"10px"}}>
                {(() => {
                  const query = searchQuery.toLowerCase().trim();
                  const filteredNotes = MONTHS.filter(m => phaseFilter === 0 || m.phase === phaseFilter)
                    .flatMap(month => month.topics.map((topic, ti) => ({ month, topic, ti })))
                    .filter(({ month, topic, ti }) => {
                      const csKey = `${month.month}_${ti}`;
                      const saved = ls.get(`rmx_cs_${csKey}`, "");
                      if (!query) return true;
                      return (
                        topic.name.toLowerCase().includes(query) ||
                        month.title.toLowerCase().includes(query) ||
                        saved.toLowerCase().includes(query)
                      );
                    });

                  if (filteredNotes.length === 0) {
                    return (
                      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 20px", color: T3 }}>
                        <div style={{ fontSize: "30px", marginBottom: "8px" }}>🔍</div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: T2, marginBottom: "4px" }}>No matching cheat sheets found</div>
                        <div style={{ fontSize: "10px" }}>Try searching for a different concept or keyword</div>
                      </div>
                    );
                  }

                  return filteredNotes.map(({ month, topic, ti }) => {
                    const csKey = `${month.month}_${ti}`;
                    const saved = ls.get(`rmx_cs_${csKey}`, "");
                    const ph = PHASES[month.phase - 1];
                    return (
                      <div key={csKey} style={{ background: CARD, border: `1px solid ${saved ? ph.c + "35" : BDR}`, borderRadius: "9px", padding: "14px", cursor: "pointer", transition: "all .2s ease" }} className="rm-card"
                        onClick={() => { setTab("roadmap"); setExp(month.month); setCsOpen(p => ({ ...p, [csKey]: true })); }}>
                        <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${ph.c}14`, border: `1px solid ${ph.c}28`, display: "flex", alignItems: "center", justify: "center", fontSize: "9px", fontWeight: "800", color: ph.c, flexShrink: 0, justifyContent: "center" }}>{month.month}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "11px", color: ph.c, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {highlightText(topic.name, searchQuery, ph.c)}
                            </div>
                            <div style={{ fontSize: "9.5px", color: T2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>
                              {highlightText(month.title, searchQuery, ph.c)}
                            </div>
                          </div>
                          {saved
                            ? <span style={{ fontSize: "8px", background: `${ph.c}14`, color: ph.c, padding: "2px 6px", borderRadius: "4px", border: `1px solid ${ph.c}28`, fontWeight: "700", flexShrink: 0 }}>✓ NOTES</span>
                            : <span style={{ fontSize: "8px", color: T3, padding: "2px 6px", border: `1px solid ${BDR}`, borderRadius: "4px", flexShrink: 0 }}>EMPTY</span>
                          }
                        </div>
                        {saved
                          ? <div style={{ fontSize: "10.5px", color: T2, lineHeight: 1.6, overflow: "hidden", maxHeight: "80px", marginTop: "6px" }}>
                              {highlightText(saved.slice(0, 200).replace(/[#\->\*`]/g, " "), searchQuery, ph.c)}
                              {saved.length > 200 ? "…" : ""}
                            </div>
                          : <div style={{ fontSize: "10px", color: T3, fontStyle: "italic", marginTop: "6px" }}>Click to open roadmap and jot down key learning concepts...</div>
                        }
                      </div>
                    );
                  });
                })()}
              </div>
            )}
            {libTab==="resources"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
                {(() => {
                  const query = searchQuery.toLowerCase().trim();
                  const filteredMonths = MONTHS.filter(m => phaseFilter === 0 || m.phase === phaseFilter)
                    .map(month => {
                      const res = getResources(month.month);
                      const filteredRes = query
                        ? res.filter(r =>
                            r.title.toLowerCase().includes(query) ||
                            r.url.toLowerCase().includes(query) ||
                            (r.note && r.note.toLowerCase().includes(query)) ||
                            r.type.toLowerCase().includes(query)
                          )
                        : res;
                      return { month, res: filteredRes };
                    })
                    .filter(({ res }) => res.length > 0);

                  if (filteredMonths.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: T3 }}>
                        <div style={{ fontSize: "30px", marginBottom: "8px" }}>🔍</div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: T2, marginBottom: "5px" }}>No matching resources found</div>
                        <div style={{ fontSize: "10px" }}>Try adding links or searching for a different term</div>
                      </div>
                    );
                  }

                  return filteredMonths.map(({ month, res }) => {
                    const ph = PHASES[month.phase - 1];
                    return (
                      <div key={month.month} style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "9px", padding: "14px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "11px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${ph.c}14`, border: `1px solid ${ph.c}28`, display: "flex", alignItems: "center", justify: "center", fontSize: "9px", fontWeight: "800", color: ph.c, justifyContent: "center" }}>{month.month}</div>
                          <div style={{ fontSize: "12.5px", fontWeight: "700", color: T1, flex: 1 }}>{highlightText(month.title, searchQuery, ph.c)}</div>
                          <span style={{ fontSize: "8.5px", background: `${ph.c}10`, color: ph.c, padding: "2px 7px", borderRadius: "4px", border: `1px solid ${ph.c}25`, fontWeight: "600" }}>{res.length} links</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                          {res.map(r => {
                            const rt = RTYPES.find(t => t.v === r.type) || RTYPES[7];
                            return (
                              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BDR}`, borderRadius: "7px", transition: "all 0.2s" }} className="rm-card">
                                <span style={{ fontSize: "13px", flexShrink: 0 }}>{rt.i}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", color: T1, fontSize: "11.5px", fontWeight: "600", transition: "color 0.2s" }}
                                    onMouseEnter={e => e.target.style.color = ph.c} onMouseLeave={e => e.target.style.color = T1}>
                                    {highlightText(r.title, searchQuery, ph.c)} ↗
                                  </a>
                                  {r.note && (
                                    <div style={{ fontSize: "9.5px", color: T3, marginTop: "2px" }}>
                                      {highlightText(r.note, searchQuery, ph.c)}
                                    </div>
                                  )}
                                </div>
                                <span style={{ fontSize: "8px", padding: "2px 6px", background: `${ph.c}0E`, border: `1px solid ${ph.c}20`, borderRadius: "4px", color: ph.c, flexShrink: 0, fontWeight: "600" }}>{rt.l}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {tab==="tracks"&&(
          <div className="rm-fade">
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"11px",padding:"13px 15px",marginBottom:"16px"}}>
              <div style={{fontSize:"9px",letterSpacing:"2px",color:T3,fontWeight:"700",marginBottom:"5px",textTransform:"uppercase"}}>Always Active · Every Week · All 12 Months</div>
              <div style={{fontSize:"12px",color:T2,lineHeight:1.65}}>These 6 tracks run every single week. They are the compound mechanism — what transforms technical skill into a profile that gets noticed. The weekly hours are sacred.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {TRACKS.map((track,i)=>{
                const isExp=trkExp===i;
                return(
                  <div key={i} style={{animation:`fadeUp .28s ease ${i*.06}s both`}}>
                    <div className="rm-card" style={{background:isExp?CARD2:CARD,border:`1px solid ${isExp?track.c+"45":BDR}`,borderRadius:isExp?"11px 11px 0 0":"11px",padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",boxShadow:isExp?`0 0 14px ${track.c}16`:"none",transition:"all .22s ease"}} onClick={()=>setTrkExp(isExp?null:i)}>
                      <div style={{fontSize:"19px",flexShrink:0}}>{track.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"12px",fontWeight:"700",color:T1}}>{track.name}</div>
                        <div style={{fontSize:"9px",color:T3,marginTop:"1px"}}>{track.weekly} · {track.target}</div>
                      </div>
                      <div style={{padding:"2px 7px",background:`${track.c}0E`,border:`1px solid ${track.c}25`,borderRadius:"4px",fontSize:"8px",color:track.c,fontWeight:"700",letterSpacing:"0.5px"}}>ALL YEAR</div>
                      <div style={{color:isExp?track.c:T3,fontSize:"9px",transition:"transform .2s",transform:isExp?"rotate(180deg)":"none"}}>▼</div>
                    </div>
                    {isExp&&(
                      <div className="rm-slide" style={{background:"rgba(5,14,30,0.97)",backdropFilter:"blur(20px)",border:`1px solid ${track.c}28`,borderTop:"none",borderRadius:"0 0 11px 11px",padding:"13px 15px"}}>
                        <div style={{fontSize:"12px",color:"#CBD5E1",lineHeight:1.65,marginBottom:"11px"}}>{track.desc}</div>
                        <div style={{fontSize:"9px",letterSpacing:"1.5px",color:T3,fontWeight:"700",marginBottom:"8px",textTransform:"uppercase"}}>Progression</div>
                        {track.steps.map((step,si)=>(
                          <div key={si} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"7px"}}>
                            <div style={{width:"5px",height:"5px",borderRadius:"50%",background:track.c,marginTop:"6px",flexShrink:0,boxShadow:`0 0 5px ${track.c}`}}/>
                            <span style={{fontSize:"11px",color:T2,lineHeight:1.6}}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="progress"&&(
          <div className="rm-fade">
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"13px",padding:"22px",marginBottom:"12px",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
              <BigRing p={totalPct} color={totalPct===100?"#10F5A0":totalPct>50?"#FBBF24":"#FF2D78"} size={108}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:T1}}>{allDone} of {allItems} topics completed</div>
                <div style={{fontSize:"10px",color:T3,marginTop:"3px"}}>{compMonths} months fully done · {MONTHS.filter(m=>pct(m,done)>0&&pct(m,done)<100).length} in progress</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"7px",marginBottom:"12px"}}>
              {PHASES.map(ph=>(
                <div key={ph.id} style={{background:CARD,border:`1px solid ${ph.c}18`,borderRadius:"10px",padding:"16px 12px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
                  <BigRing p={phasePct(ph.id)} color={ph.c} size={68}/>
                  <div>
                    <div style={{fontSize:"8px",color:ph.c,letterSpacing:"1.5px",fontWeight:"700",textTransform:"uppercase"}}>{ph.name}</div>
                    <div style={{fontSize:"10px",color:T2,marginTop:"1px"}}>{ph.full}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"10px",padding:"14px 16px",marginBottom:"12px"}}>
              <div style={{fontSize:"9px",letterSpacing:"2px",color:T3,fontWeight:"700",marginBottom:"13px",textTransform:"uppercase"}}>Month-by-Month</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"7px"}}>
                {MONTHS.map(m=>{
                  const p=pct(m,done);const ph=PHASES[m.phase-1];const comp=p===100;
                  return(
                    <div key={m.month} onClick={()=>{setTab("roadmap");setExp(m.month);}} style={{background:comp?`${ph.c}10`:"rgba(255,255,255,0.02)",border:`1px solid ${comp?ph.c+"30":BDR}`,borderRadius:"8px",padding:"10px 7px",textAlign:"center",cursor:"pointer"}} className="rm-card">
                      <div style={{fontSize:"10px",fontWeight:"700",color:comp?ph.c:T3,marginBottom:"5px"}}>M{String(m.month).padStart(2,"0")}</div>
                      <div style={{position:"relative",display:"inline-flex"}}>
                        <Ring p={p} color={ph.c} size={36} stroke={3}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",fontWeight:"700",color:p>0?ph.c:T3}}>{p}%</div>
                      </div>
                      {bkm[m.month]&&<div style={{fontSize:"9px",marginTop:"3px"}}>⭐</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            {Object.keys(bkm).some(k=>bkm[k])&&(
              <div style={{background:CARD,border:"1px solid rgba(251,191,36,0.15)",borderRadius:"10px",padding:"13px 15px"}}>
                <div style={{fontSize:"9px",letterSpacing:"2px",color:"#FBBF24",fontWeight:"700",marginBottom:"9px",textTransform:"uppercase"}}>⭐ Bookmarks</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                  {MONTHS.filter(m=>bkm[m.month]).map(m=>{
                    const ph=PHASES[m.phase-1];
                    return(
                      <div key={m.month} onClick={()=>{setTab("roadmap");setExp(m.month);}} style={{padding:"5px 10px",background:`${ph.c}0E`,border:`1px solid ${ph.c}28`,borderRadius:"6px",cursor:"pointer"}} className="rm-card">
                        <div style={{fontSize:"10px",fontWeight:"700",color:ph.c}}>Month {m.month}</div>
                        <div style={{fontSize:"9px",color:T3,marginTop:"1px"}}>{m.title.split(" ").slice(0,2).join(" ")}...</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  </div>

  {/* Persistent Note Drawer */}
  <ModuleNoteDrawer activeMonth={activeNoteMonth} onClose={() => setActiveNoteMonth(null)} onSave={triggerSaveSync} />

  {/* Celebratory Animation Overlay */}
  <CelebrationOverlay active={confetti !== null} />

  <Pomodoro/>
</div>
  );
}

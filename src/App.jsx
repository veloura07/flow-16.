import { useState, useEffect, useCallback, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, serverTimestamp, OperationType, handleFirestoreError } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Settings, LogOut, X, ChevronRight, Sliders, User, Send, Trash2, Volume2, VolumeX, Brain, Zap, RefreshCw, Star,
  Terminal, Cpu, Database, Layers, Play, Activity, Network, ArrowRight, Sun, Moon
} from "lucide-react";

const playSuccessBeep = (enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
};

const playSweepSound = (enabled, isUp = true) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "triangle";
    const startFreq = isUp ? 330 : 660;
    const endFreq = isUp ? 660 : 330;
    
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
};


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@1,800;1,900&display=swap');
@keyframes swayTail {
  0% { transform: rotate(-8deg); }
  100% { transform: rotate(12deg); }
}
@keyframes breatheHead {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(1.2px) rotate(0.5deg); }
}
:root {
  --nebula-purple: rgba(139, 92, 246, 0.16);
  --nebula-teal: rgba(20, 184, 166, 0.14);
  --nebula-gold: rgba(245, 158, 11, 0.11);
  --nebula-magenta: rgba(236, 72, 153, 0.10);
}
@keyframes spaceThrum {
  0%, 100% {
    transform: scale(1.0);
    opacity: 0.90;
    filter: brightness(0.95);
  }
  50% {
    transform: scale(1.025);
    opacity: 1.0;
    filter: brightness(1.1);
  }
}
.deep-space-thrum {
  animation: spaceThrum 16s ease-in-out infinite;
  transform-origin: center center;
}
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
@keyframes twinkle {
  0%, 100% { opacity: 0.25; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.25); }
}
@keyframes shoot {
  0% { transform: translate(100px, -100px) rotate(-40deg) scale(0); opacity: 0; }
  2% { opacity: 1; }
  8% { transform: translate(-300px, 300px) rotate(-40deg) scale(1); opacity: 1; }
  12%, 100% { transform: translate(-500px, 500px) rotate(-40deg) scale(0); opacity: 0; }
}
@keyframes floatShip1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(12px, -15px) rotate(1.5deg); }
  50% { transform: translate(-8px, 10px) rotate(-1deg); }
  75% { transform: translate(15px, 8px) rotate(0.8deg); }
}
@keyframes floatShip2 {
  0%, 100% { transform: translate(0, 0) rotate(3deg); }
  33% { transform: translate(-18px, 12px) rotate(1deg); }
  66% { transform: translate(12px, -18px) rotate(5deg); }
}
@keyframes slowRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes deathStarOrbit {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateX(30vw) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateX(30vw) rotate(-360deg);
  }
}
@keyframes deathStarGlow {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.15)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
  }
  50% {
    filter: drop-shadow(0 0 35px rgba(16, 245, 160, 0.45)) drop-shadow(0 0 6px rgba(16, 245, 160, 0.2));
  }
}
@keyframes nebulaDriftA {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(60px, -40px) scale(1.15) rotate(90deg); }
}
@keyframes nebulaDriftB {
  0%, 100% { transform: translate(0, 0) scale(1.1) rotate(120deg); }
  50% { transform: translate(-70px, 50px) scale(0.9) rotate(240deg); }
}
@keyframes nebulaDriftC {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(270deg); }
  50% { transform: translate(-50px, -50px) scale(1.2) rotate(120deg); }
}
@keyframes spaceChaseTIE {
  0% {
    transform: translate(-150px, 15vh) scale(0.4) rotate(12deg);
    opacity: 0;
  }
  5% {
    opacity: 0.85;
  }
  25% {
    transform: translate(25vw, 32vh) scale(0.65) rotate(-8deg);
  }
  50% {
    transform: translate(52vw, 12vh) scale(0.8) rotate(18deg);
  }
  75% {
    transform: translate(78vw, 28vh) scale(0.65) rotate(-5deg);
  }
  95% {
    opacity: 0.85;
  }
  100% {
    transform: translate(115vw, 10vh) scale(0.4) rotate(15deg);
    opacity: 0;
  }
}
@keyframes spaceChaseXWing {
  0% {
    transform: translate(-220px, 18vh) scale(0.38) rotate(10deg);
    opacity: 0;
  }
  7% {
    opacity: 0.9;
  }
  27% {
    transform: translate(22vw, 34vh) scale(0.63) rotate(-10deg);
  }
  52% {
    transform: translate(49vw, 14vh) scale(0.78) rotate(20deg);
  }
  77% {
    transform: translate(75vw, 30vh) scale(0.63) rotate(-7deg);
  }
  94% {
    opacity: 0.9;
  }
  100% {
    transform: translate(115vw, 13vh) scale(0.38) rotate(12deg);
    opacity: 0;
  }
}
@keyframes dynamicShootingStar {
  0% { transform: translate(0, 0) scaleX(0); opacity: 0; }
  10% { opacity: 1; transform: translate(-80px, 80px) scaleX(1.3); }
  35% { transform: translate(-300px, 300px) scaleX(1); opacity: 1; }
  50%, 100% { transform: translate(-450px, 450px) scaleX(0.2); opacity: 0; }
}
@keyframes tieGlide {
  0% {
    transform: translate(-150px, 45vh) scale(0.3) rotate(15deg);
    opacity: 0;
  }
  8% {
    opacity: 0.9;
  }
  30% {
    transform: translate(30vw, 38vh) scale(0.55) rotate(-12deg);
  }
  60% {
    transform: translate(65vw, 52vh) scale(0.75) rotate(10deg);
  }
  85% {
    transform: translate(90vw, 42vh) scale(0.55) rotate(-5deg);
  }
  95% {
    opacity: 0.9;
  }
  100% {
    transform: translate(115vw, 48vh) scale(0.3) rotate(8deg);
    opacity: 0;
  }
}
@keyframes xWingClimb {
  0% {
    transform: translate(115vw, 85vh) scale(0.3) rotate(-40deg);
    opacity: 0;
  }
  6% {
    opacity: 0.95;
  }
  30% {
    transform: translate(80vw, 68vh) scale(0.55) rotate(-25deg);
  }
  60% {
    transform: translate(45vw, 50vh) scale(0.75) rotate(-35deg);
  }
  85% {
    transform: translate(15vw, 25vh) scale(0.55) rotate(-20deg);
  }
  94% {
    opacity: 0.95;
  }
  100% {
    transform: translate(-15vw, 10vh) scale(0.3) rotate(-30deg);
    opacity: 0;
  }
}
.rm-fade{animation:fadeUp .32s cubic-bezier(.4,0,.2,1) both}
.rm-slide{animation:slideDown .24s cubic-bezier(.4,0,.2,1) both}
.rm-card{transition:transform .3s cubic-bezier(.34, 1.56, .64, 1),box-shadow .3s ease,background-color .3s ease,border-color .3s ease;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.rm-card:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 16px 36px rgba(0,0,0,0.55), 0 0 25px var(--ph-glow, rgba(124,58,237,0.18)), inset 0 1px 0 rgba(255,255,255,0.08);border-color:var(--ph-hover-border, rgba(255,255,255,0.18)) !important}
.rm-btn{transition:all .2s cubic-bezier(.4,0,.2,1);border:none;cursor:pointer}
.rm-btn:active{transform:scale(0.96)}
.rm-check{transition:all .2s cubic-bezier(.4,0,.2,1);cursor:pointer;user-select:none}
.rm-check:hover{transform:scale(1.08)}
.rm-tab{transition:all .2s ease;border:none;cursor:pointer;background:transparent;white-space:nowrap}
.shimmer{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.35) 50%,#fff 100%);background-size:400% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s ease infinite}
.mono{font-family:'JetBrains Mono',monospace!important}
.no-scrollbar::-webkit-scrollbar { display: none !important; }
.no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
.star {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: #ffffff;
}
.star-glow-blue {
  box-shadow: 0 0 8px #38bdf8, 0 0 2px #ffffff;
}
.star-glow-pink {
  box-shadow: 0 0 8px #f472b6, 0 0 2px #ffffff;
}
.star-glow-amber {
  box-shadow: 0 0 8px #fbbf24, 0 0 2px #ffffff;
}
.star-glow-white {
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}
.shooting-star-line {
  position: absolute;
  width: 150px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(56,189,248,0.4) 30%, rgba(255,45,120,0) 100%);
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 10px #38bdf8;
}
.dynamic-shooting-star {
  position: absolute;
  pointer-events: none;
  height: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(124,58,237,0.5) 40%, rgba(255,255,255,0) 100%);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.8), 0 0 4px #ffffff;
  animation: dynamicShootingStar 2.2s cubic-bezier(0.1, 0.8, 0.25, 1) both;
}
@keyframes modalPopIn {
  0% { transform: scale(0.92) translateY(12px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes backdropFadeIn {
  0% { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); background: rgba(2, 6, 17, 0); }
  100% { opacity: 1; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background: rgba(2, 6, 17, 0.7); }
}
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
  {name:"DSA Practice",icon:"⚡",c:"#22D3EE",weekly:"5-8 hrs/wk",target:"300-500 problems",desc:"DSA: Focus on Pattern Recognition. Understand the theoretical tradeoffs under the hood. Train yourself to map problem signals to concrete family patterns within 60 seconds.",steps:["M1-2: Easy arrays, strings, hashing. Build speed and confidence","M3-4: Easy-medium mix. Introduce tree traversals early","M5-6: Medium primary. Sliding window, two pointers, BST, heaps","M7-8: Medium-hard. Graphs, DP, backtracking, greedy","M9-12: Hard patterns. Mock interviews. Timed Codeforces contests"]},
  {name:"Open Source",icon:"🔓",c:"#A78BFA",weekly:"3-5 hrs/wk",target:"20-50 merged PRs",desc:"Become a maintainer-level contributor. Merging high-quality features, reviewing others' code, writing robust unit/integration tests, and maintaining CI pipelines is the ultimate GSoC and elite industry credential.",steps:["M1-2: Read large codebases. Fix typos and broken links","M3-4: Improve documentation, write setup/contribution guides","M5-6: Bug fixes from issue tracker. Discuss approach before submitting","M7-8: Add small features. Review others PRs. Become known","M9-12: Real features in Python/AI frameworks. Own a sub-area"]},
  {name:"GitHub and Portfolio",icon:"📁",c:"#34D399",weekly:"Daily",target:"1000+ commits, 5 flagships",desc:"Career readiness for Frontier AI, Quant firms, and elite startups. Build a professional unified resume in 2028: expert Python, system-level C/C++, advanced SQL, and TypeScript tooling.",steps:["M1: Profile README, repository structure templates, learning logs","M2-3: Small utility projects — typed, tested, documented","M4-6: Project depth increases. GitHub Actions on everything","M7-9: Full-stack deployed projects. Architecture diagrams","M10-12: AI flagship projects. GitHub Pages portfolio site"]},
  {name:"Technical Reading",icon:"📖",c:"#FBBF24",weekly:"3 hrs/wk",target:"1 deep-dive/week",desc:"The Primary Sources Rule. Top systems engineers read RFCs, official manual specifications, developer logs, and arXiv papers rather than passive video tutorials.",steps:["M1-3: Stripe/Netflix/Cloudflare tech blogs. OSS documentation","M4-6: System design articles. Begin Designing Data-Intensive Applications","M7-9: Architecture papers. Complete DDIA. Database internals","M10-12: arXiv ML/AI/safety papers. Benchmark reports. Research blogs"]},
  {name:"Technical Writing",icon:"✍️",c:"#F87171",weekly:"1-2 hrs/wk",target:"10+ blog posts",desc:"Writing is a force multiplier that forces precision and clarifies complex systems thinking. Write design proposals, RFCs, issue reports, PR summaries, and architectural logs.",steps:["M1-3: READMEs, setup guides, architecture decision records","M4-6: Technical breakdowns of things you built","M7-9: System design write-ups, tradeoff analysis posts","M10-12: Blog posts on RAG, agents, LLM internals, safety"]},
  {name:"AI Industry Awareness",icon:"🧠",c:"#EC4899",weekly:"2-3 hrs/wk",target:"Ecosystem expert",desc:"Understand model providers, serving infrastructure, orchestration frameworks, and hardware bottlenecks. Gain complete system-level context of where the industry is moving.",steps:["M1-6: AI landscape overview. What models exist. What is changing","M7-9: Infrastructure focus: inference, serving, orchestration","M10-12: Research papers: attention variants, agent frameworks, alignment"]}
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

// ============================================================================
// PREMIUM HIGH-FIDELITY STAR WARS ELEMENT REPLICAS
// ============================================================================

function FactionIcon({ name, size = 16, color = "currentColor", className = "", style = {} }) {
  if (name === "rebel") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        {/* Rebel Alliance Phoenix Crest - precise curves matching exact logo */}
        <path d="M50,85 C35,85 24,73 22,58 C32,61 41,54 44,43 C39,40 34,32 33,23 C35,26 38,28 42,28 C42,20 45,12 50,7 C55,12 58,20 58,28 C62,28 65,26 67,23 C66,32 61,40 56,43 C59,54 68,61 78,58 C76,73 65,85 50,85 Z" fill={color}/>
      </svg>
    );
  }
  if (name === "empire") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        {/* Galactic Empire 6-spoke Crest - precise cog geometry */}
        <path d="M50,10 C28,10 10,28 10,50 C10,72 28,90 50,90 C72,90 90,72 90,50 C90,28 72,10 50,10 Z M50,16 C53.5,16 57,17 60,18.7 L56,25.5 C54.2,24.5 52.2,24 50,24 C47.8,24 45.8,24.5 44,25.5 L40,18.7 C43,17 46.5,16 50,16 Z M26.2,25.2 C28.5,23.3 31.2,21.8 34.2,20.8 L34.2,28.8 C32.8,29.4 31.5,30.3 30.4,31.4 L23.6,27.4 C24.4,26.6 25.3,25.9 26.2,25.2 Z M16,50 C16,46.5 17,43 18.7,40 L25.5,44 C24.5,45.8 24,47.8 24,50 C24,52.2 24.5,54.2 25.5,56 L18.7,60 C17,57 16,53.5 16,50 Z M26.2,74.8 C25.3,74.1 24.4,73.4 23.6,72.6 L30.4,68.6 C31.5,69.7 32.8,70.6 34.2,71.2 L34.2,79.2 C31.2,78.2 28.5,76.7 26.2,74.8 Z M50,84 C46.5,84 43,83 40,81.3 L44,74.5 C45.8,75.5 47.8,76 50,76 C52.2,76 54.2,75.5 56,74.5 L60,81.3 C57,83 53.5,84 50,84 Z M73.8,74.8 C71.5,76.7 68.8,78.2 65.8,79.2 L65.8,71.2 C67.2,70.6 68.5,69.7 69.6,68.6 L76.4,72.6 C75.6,73.4 74.7,74.1 73.8,74.8 Z M84,50 C84,53.5 83,57 81.3,60 L74.5,56 C75.5,54.2 76,52.2 76,50 C76,47.8 75.5,45.8 74.5,44 L81.3,40 C83,43 84,46.5 84,50 Z M73.8,25.2 C74.7,25.9 75.6,26.6 76.4,27.4 L69.6,31.4 C68.5,30.3 67.2,29.4 65.8,28.8 L65.8,20.8 C68.8,21.8 71.5,23.3 73.8,25.2 Z" fill={color}/>
      </svg>
    );
  }
  if (name === "jedi") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        {/* Jedi Order Winged Lightsaber Symbol - extremely detailed */}
        <path d="M50,12 C51.5,12 52,19 52,36 L52,65 C52,66 51,67 50,67 C49,67 48,66 48,65 L48,36 C48,19 48.5,12 50,12 Z M50,69 C51,69 52,70 52,71 L52,83 C52,84 51,85 50,85 C49,85 48,84 48,83 L48,71 C48,70 49,69 50,69 Z M50,45 C55,42 63,38 71,36 C67,49 59,62 50,68 C41,62 33,49 29,36 C37,38 45,42 50,45 Z M50,56 C52,53 57,50 63,49 C60,56 56,62 50,65 C44,62 40,56 37,49 C43,50 48,53 50,56 Z" fill={color}/>
      </svg>
    );
  }
  if (name === "mando") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} style={{ display: "inline-block", verticalAlign: "middle", ...style }}>
        {/* Mandalorian Mythosaur Skull - premium curves */}
        <path d="M50,12 C48,12 45,17 45,25 C45,33 48,38 39,41 C34,43 27,40 23,44 C19,48 17,56 21,64 C24,70 31,71 33,68 C35,65 35,60 37,60 C39,60 40,64 41,73 C42,82 47,84 50,84 C53,84 58,82 59,73 C60,64 61,60 63,60 C65,60 65,65 67,68 C69,71 76,70 79,64 C83,56 81,48 77,44 C73,40 66,43 61,41 C52,38 55,33 55,25 C55,17 52,12 50,12 Z M50,19 C51,19 52,21 52,25 C52,29 51,31 50,31 C49,31 48,29 48,25 C48,21 49,19 50,19 Z M45,44 L39,54 L43,54 Z M55,44 L57,54 L61,54 Z" fill={color}/>
      </svg>
    );
  }
  return null;
}

function MillenniumFalconSVG({ width = 115, height = 100, className = "", style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Dynamic Cyan Sublight Engine Exhaust Loop */}
      <path d="M 46 112 C 60 123, 100 123, 114 112" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 0 12px #22d3ee)" opacity="0.85" />
      <path d="M 49 111 C 61 119, 99 119, 111 111" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

      {/* Main Saucer Disc Hull */}
      <circle cx="80" cy="72" r="44" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <circle cx="80" cy="72" r="34" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

      {/* Surface armor panel variation & weathering */}
      <path d="M 44 46 A 44 44 0 0 1 116 46 L 106 52 A 34 34 0 0 0 54 52 Z" fill="#64748b" opacity="0.75" />
      
      {/* Crimson decals/accents exactly as Millennium Falcon Image 1 */}
      <path d="M 39 62 L 43 55 L 51 59 L 47 67 Z" fill="#b91c1c" />
      <path d="M 121 62 L 117 55 L 109 59 L 113 67 Z" fill="#b91c1c" />
      <path d="M 74 108 L 86 108 L 84 100 L 76 100 Z" fill="#b91c1c" />
      <path d="M 94 95 L 102 90 L 98 85 L 90 90 Z" fill="#475569" />

      {/* Twin Front Forward Mandibles with canonical inner details */}
      {/* Left Mandible */}
      <path d="M 45 56 L 45 12 L 62 12 L 68 46 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <path d="M 49 16 L 49 42 L 58 42 L 58 16 Z" fill="#475569" stroke="#334155" strokeWidth="0.8" />
      <rect x="51" y="20" width="4" height="14" fill="#1e293b" />
      
      {/* Right Mandible */}
      <path d="M 115 56 L 115 12 L 98 12 L 92 46 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <path d="M 111 16 L 111 42 L 102 42 L 102 16 Z" fill="#475569" stroke="#334155" strokeWidth="0.8" />
      <rect x="105" y="20" width="4" height="14" fill="#1e293b" />

      {/* Central mandible tray gap & launcher */}
      <rect x="68" y="28" width="24" height="10" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <circle cx="80" cy="33" r="3.5" fill="#475569" />
      <line x1="68" y1="33" x2="92" y2="33" stroke="#334155" />

      {/* Right-Mounted Outrigger Cockpit Cabin - Falcon's unique asymmetry */}
      <path d="M 118 68 L 142 58 L 146 40 L 132 43 L 118 58 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <path d="M 132 43 L 146 40 L 150 24 L 136 30 Z" fill="#475569" stroke="#334155" strokeWidth="1.2" />
      <path d="M 139 32 L 146 29 L 147 34 L 141 36 Z" fill="#38bdf8" opacity="0.8" />
      <path d="M 141 36 L 147 34 L 145 40 L 139 40 Z" fill="#38bdf8" opacity="0.8" />

      {/* Portside Circular Radar Antenna (Rectangular dish version from sequels or circular) */}
      <ellipse cx="56" cy="48" rx="8" ry="5.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" transform="rotate(-15 56 48)" />
      <path d="M 56 48 L 48 40" stroke="#334155" strokeWidth="1.5" />
      <rect x="46" y="38" width="4" height="4" fill="#475569" />

      {/* Core Quad-Laser Cannons Turret */}
      <circle cx="80" cy="70" r="8" fill="#475569" stroke="#334155" strokeWidth="1.2" />
      <line x1="77" y1="70" x2="77" y2="48" stroke="#f8fafc" strokeWidth="2" />
      <line x1="83" y1="70" x2="83" y2="48" stroke="#f8fafc" strokeWidth="2" />
      <rect x="75" y="55" width="10" height="2" fill="#ef4444" />

      {/* Circular cooling vents at rear exhaust */}
      <circle cx="64" cy="92" r="3.5" fill="#1e293b" stroke="#475569" />
      <circle cx="74" cy="96" r="3.5" fill="#1e293b" stroke="#475569" />
      <circle cx="86" cy="96" r="3.5" fill="#1e293b" stroke="#475569" />
      <circle cx="96" cy="92" r="3.5" fill="#1e293b" stroke="#475569" />
    </svg>
  );
}

function StarDestroyerSVG({ width = 220, height = 130, className = "", style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Majestic Sublight Engine Thrusters Glow */}
      <circle cx="152" cy="38" r="5" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
      <circle cx="152" cy="55" r="7.5" fill="#7dd3fc" filter="drop-shadow(0 0 12px #38bdf8)" />
      <circle cx="152" cy="72" r="5" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />

      {/* Main Wedge triangular Hull Structure */}
      <polygon points="8,55 150,12 150,98" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      
      {/* Tiered surface plating details */}
      <polygon points="24,55 148,20 148,90" fill="#cbd5e1" opacity="0.9" />
      <polygon points="40,55 146,28 146,82" fill="#64748b" opacity="0.4" />
      
      {/* Elevated central spine terraces */}
      <polygon points="62,55 144,36 144,74" fill="#475569" stroke="#334155" strokeWidth="1" />
      <polygon points="84,55 142,42 142,68" fill="#334155" />

      {/* Massive Command Bridge Tower structure */}
      <rect x="112" y="40" width="34" height="30" fill="#475569" stroke="#334155" strokeWidth="1" />
      <rect x="107" y="44" width="44" height="8" fill="#334155" />
      
      {/* T-Neck and Shield Generator Globes */}
      <rect x="122" y="30" width="14" height="10" fill="#64748b" stroke="#334155" strokeWidth="1" />
      <polygon points="110,30 148,30 142,22 116,22" fill="#475569" stroke="#334155" strokeWidth="1" />
      
      <circle cx="123" cy="18" r="4" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" />
      <circle cx="135" cy="18" r="4" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" />
      <line x1="123" y1="18" x2="123" y2="22" stroke="#334155" />
      <line x1="135" y1="18" x2="135" y2="22" stroke="#334155" />

      {/* Middle side trench dividing line with hangar lights */}
      <line x1="8" y1="55" x2="150" y2="55" stroke="#334155" strokeWidth="1.2" />
      <line x1="15" y1="55" x2="148" y2="55" stroke="#fef08a" strokeWidth="1" strokeDasharray="1,5" opacity="0.85" filter="drop-shadow(0 0 2px #eab308)" />

      {/* Surface grid panel detail lines */}
      <line x1="45" y1="41" x2="148" y2="20" stroke="#334155" strokeWidth="0.8" opacity="0.4" />
      <line x1="45" y1="69" x2="148" y2="90" stroke="#334155" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function XWingSVG({ width = 95, height = 90, className = "", style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Double firing laser beams from wingtips */}
      <line x1="15" y1="13" x2="-80" y2="13" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="14,16" opacity="0.9" filter="drop-shadow(0 0 8px #ef4444)" />
      <line x1="15" y1="87" x2="-80" y2="87" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="14,16" opacity="0.9" filter="drop-shadow(0 0 8px #ef4444)" />

      {/* Long Nose Cone fuselage */}
      <path d="M 115 50 L 35 42 L 35 58 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      <path d="M 115 50 L 80 46 L 80 54 Z" fill="#cbd5e1" />
      
      {/* Cockpit Canopy */}
      <path d="M 54 45 L 75 45 L 67 55 L 50 55 Z" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
      <rect x="58" y="46" width="10" height="4.5" fill="#0ea5e9" opacity="0.6" />

      {/* Blue R2-D2 Droid Socket unit behind pilot */}
      <circle cx="45" cy="44" r="3" fill="#cbd5e1" stroke="#1d4ed8" strokeWidth="0.6" />
      <circle cx="45" cy="44" r="1.5" fill="#3b82f6" />

      {/* Upper Wings (Split S-foils structure) with red squadron markers */}
      <path d="M 42 45 L 18 15 L 12 18 L 36 49 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
      <path d="M 28 27 L 24 22 L 20 25 L 24 30 Z" fill="#dc2626" />

      {/* Lower Wings */}
      <path d="M 42 55 L 18 85 L 12 82 L 36 51 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
      <path d="M 28 73 L 24 78 L 20 75 L 24 70 Z" fill="#dc2626" />

      {/* Background Wing planes for split depth */}
      <path d="M 48 45 L 26 23 L 22 26 L 42 49 Z" fill="#94a3b8" stroke="#334155" />
      <path d="M 48 55 L 26 77 L 22 74 L 42 51 Z" fill="#94a3b8" stroke="#334155" />

      {/* Four Cylinder Engine roots and red-hot exhaust nozzles */}
      <circle cx="43" cy="37" r="5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="43" cy="63" r="5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="49" cy="37" r="3" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />
      <circle cx="49" cy="63" r="3" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)" />

      {/* Long wingtip laser canons extending forward */}
      <rect x="5" y="11" width="16" height="3" fill="#475569" stroke="#334155" />
      <line x1="5" y1="12.5" x2="22" y2="12.5" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="2" cy="12.5" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />

      <rect x="5" y="86" width="16" height="3" fill="#475569" stroke="#334155" />
      <line x1="5" y1="87.5" x2="22" y2="87.5" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="2" cy="87.5" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />

      <circle cx="41" cy="50" r="6" fill="#334155" stroke="#94a3b8" />
    </svg>
  );
}

function DeathStarSVG({ size = 180, className = "", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Base Spherical Core */}
      <circle cx="100" cy="100" r="92" fill="#1e293b" stroke="#475569" strokeWidth="2.2" />
      <circle cx="100" cy="100" r="92" fill="url(#dsMetalGrad)" />

      {/* Concave Superlaser Focus Dish */}
      <ellipse cx="140" cy="62" rx="22" ry="16" fill="#0f172a" stroke="#475569" strokeWidth="1.5" transform="rotate(-15 140 62)" />
      <ellipse cx="140" cy="62" rx="14" ry="10" fill="#334155" stroke="#64748b" strokeWidth="1" transform="rotate(-15 140 62)" />
      <circle cx="140" cy="62" r="3.5" fill="#10f5a0" filter="drop-shadow(0 0 5px #10f5a0)" />

      {/* Firing Tributary Laser Beams converging */}
      <line x1="124" y1="55" x2="140" y2="62" stroke="#10f5a0" strokeWidth="0.8" opacity="0.8" />
      <line x1="156" y1="55" x2="140" y2="62" stroke="#10f5a0" strokeWidth="0.8" opacity="0.8" />
      <line x1="130" y1="73" x2="140" y2="62" stroke="#10f5a0" strokeWidth="0.8" opacity="0.8" />
      <line x1="150" y1="73" x2="140" y2="62" stroke="#10f5a0" strokeWidth="0.8" opacity="0.8" />
      <line x1="140" y1="62" x2="80" y2="105" stroke="#10f5a0" strokeWidth="1.5" opacity="0.35" strokeDasharray="3,6" filter="drop-shadow(0 0 4px #10f5a0)" />

      {/* Horizontal Equatorial Trench split */}
      <path d="M 8 100 Q 100 102 192 100" stroke="#0f172a" strokeWidth="3" fill="none" />
      <path d="M 8 100 Q 100 102 192 100" stroke="#475569" strokeWidth="1" fill="none" />

      {/* Grid segments and meridians lines */}
      <path d="M 100 8 A 92 92 0 0 1 100 92" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 35 40 C 60 60, 140 60, 165 40" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 20 60 C 50 80, 150 80, 180 60" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />

      <path d="M 100 108 A 92 92 0 0 1 100 192" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M 35 140 C 60 160, 140 160, 165 140" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M 20 160 C 50 180, 150 180, 180 160" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.4" />

      {/* Scattered city light points representing superstation activity */}
      <circle cx="45" cy="45" r="1.1" fill="#fef08a" opacity="0.9" />
      <circle cx="72" cy="35" r="1.1" fill="#fef08a" opacity="0.95" />
      <circle cx="110" cy="25" r="1.1" fill="#38bdf8" opacity="0.9" />
      <circle cx="85" cy="70" r="1.3" fill="#38bdf8" opacity="0.85" />
      <circle cx="155" cy="125" r="1.1" fill="#fef08a" opacity="0.9" />
      <circle cx="112" cy="155" r="1.1" fill="#38bdf8" opacity="0.95" />
      <circle cx="68" cy="165" r="1.1" fill="#fef08a" opacity="0.9" />
      <circle cx="160" cy="160" r="1.3" fill="#38bdf8" opacity="0.8" />
      <circle cx="35" cy="115" r="1.1" fill="#38bdf8" opacity="0.9" />

      <defs>
        <radialGradient id="dsMetalGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="55%" stopColor="#0f172a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function TieFighterSVG({ width = 85, height = 90, className = "", style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Green Kyber Laser Blaster Bolt from center cannons */}
      <line x1="50" y1="52" x2="180" y2="52" stroke="#10f5a0" strokeWidth="2.5" strokeDasharray="14,16" opacity="0.9" filter="drop-shadow(0 0 8px #10f5a0)" />
      
      {/* Left Hexagonal Solar Wing Grid Panel */}
      <polygon points="12,15 22,5 22,95 12,85" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <polygon points="14,20 20,12 20,88 14,80" fill="#1e293b" />
      <line x1="12" y1="50" x2="22" y2="50" stroke="#475569" strokeWidth="1" />
      <line x1="17" y1="10" x2="17" y2="90" stroke="#475569" strokeWidth="1" />
      
      {/* Left Wing connector pylon strut */}
      <rect x="22" y="47" width="16" height="6" fill="#64748b" stroke="#334155" strokeWidth="1" />
      <line x1="22" y1="50" x2="38" y2="50" stroke="#1e293b" strokeWidth="1" />

      {/* Main Spherical Cockpit Pod */}
      <circle cx="50" cy="50" r="16" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      
      {/* Viewport mesh panel segmentation details */}
      <circle cx="50" cy="50" r="11" fill="#475569" stroke="#1e293b" strokeWidth="1" />
      <circle cx="50" cy="50" r="4" fill="#090d16" stroke="#475569" strokeWidth="0.8" />
      <line x1="50" y1="39" x2="50" y2="61" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="39" y1="50" x2="61" y2="50" stroke="#1e293b" strokeWidth="1.2" />
      <line x1="42.2" y1="42.2" x2="57.8" y2="57.8" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="42.2" y1="57.8" x2="57.8" y2="42.2" stroke="#1e293b" strokeWidth="0.8" />

      {/* Twin Chin Laser Cannons with glowing red lights */}
      <circle cx="47" cy="58" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />
      <circle cx="53" cy="58" r="1.5" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)" />
      
      {/* Right Wing connector pylon strut */}
      <rect x="62" y="47" width="16" height="6" fill="#64748b" stroke="#334155" strokeWidth="1" />
      <line x1="62" y1="50" x2="78" y2="50" stroke="#1e293b" strokeWidth="1" />

      {/* Right Hexagonal Solar Wing Grid Panel */}
      <polygon points="88,15 78,5 78,95 88,85" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <polygon points="86,20 80,12 80,88 86,80" fill="#1e293b" />
      <line x1="78" y1="50" x2="88" y2="50" stroke="#475569" strokeWidth="1" />
      <line x1="83" y1="10" x2="83" y2="90" stroke="#475569" strokeWidth="1" />
    </svg>
  );
}

const SYSTEMS = [
  [
    { r: 139, g: 92, b: 246, a: 0.14 }, // Deep Purple
    { r: 20, g: 184, b: 166, a: 0.12 }, // Vibrant Teal
    { r: 245, g: 158, b: 11, a: 0.08 }  // Soft Gold
  ],
  [
    { r: 20, g: 184, b: 166, a: 0.14 }, // Vibrant Teal
    { r: 245, g: 158, b: 11, a: 0.12 }, // Soft Gold
    { r: 139, g: 92, b: 246, a: 0.08 }  // Deep Purple
  ],
  [
    { r: 245, g: 158, b: 11, a: 0.14 }, // Soft Gold
    { r: 139, g: 92, b: 246, a: 0.12 }, // Deep Purple
    { r: 20, g: 184, b: 166, a: 0.08 }  // Vibrant Teal
  ]
];

const lerp = (v0, v1, t) => v0 + (v1 - v0) * t;

const getSystemColorString = (nebIdx, pct, alphaMultiplier = 1.0) => {
  const sysA = pct <= 0.5 ? SYSTEMS[0][nebIdx] : SYSTEMS[1][nebIdx];
  const sysB = pct <= 0.5 ? SYSTEMS[1][nebIdx] : SYSTEMS[2][nebIdx];
  const t = pct <= 0.5 ? pct * 2 : (pct - 0.5) * 2;
  const r = Math.round(lerp(sysA.r, sysB.r, t));
  const g = Math.round(lerp(sysA.g, sysB.g, t));
  const b = Math.round(lerp(sysA.b, sysB.b, t));
  const a = lerp(sysA.a, sysB.a, t) * alphaMultiplier;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function UniverseBackground({ speed = 1 }) {
  const canvasRef = useRef(null);
  
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  
  // Track viewport scrolling and velocity
  const scrollYRef = useRef(0);
  const velocityRef = useRef(0);
  const smoothedVelocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollTimeout = useRef(null);

  // Background state vectors
  const starsRef = useRef([]);
  const nebulaeRef = useRef([]);

  useEffect(() => {
    // Generate beautiful multi-layered starry space
    const colors = ["#ffffff", "#38bdf8", "#f472b6", "#fbbf24", "#a78bfa", "#10f5a0"];
    const tempStars = [];
    
    // Distant background stars (Layer 1) - small, dim, slowest scroll
    for (let i = 0; i < 45; i++) {
      tempStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 0.7 + 0.4,
        color: "#ffffff",
        baseOpacity: Math.random() * 0.4 + 0.2,
        twinkleSpeed: 0.0006 + Math.random() * 0.0014,
        twinklePhase: Math.random() * Math.PI * 2,
        parallaxFactor: 0.045
      });
    }

    // Mid-distance colorful stars (Layer 2) - medium size, colorful, medium scroll
    for (let i = 0; i < 20; i++) {
      tempStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.3 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseOpacity: Math.random() * 0.55 + 0.35,
        twinkleSpeed: 0.001 + Math.random() * 0.002,
        twinklePhase: Math.random() * Math.PI * 2,
        parallaxFactor: 0.12
      });
    }

    // High-intensity foreground stars (Layer 3) - large, highly glowing, fast scroll
    for (let i = 0; i < 6; i++) {
      tempStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.1 + 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseOpacity: Math.random() * 0.65 + 0.45,
        twinkleSpeed: 0.0018 + Math.random() * 0.0025,
        twinklePhase: Math.random() * Math.PI * 2,
        parallaxFactor: 0.25
      });
    }

    starsRef.current = tempStars;

    // Create 3 layered organic nebula clouds in the deep galaxy canvas
    nebulaeRef.current = [
      {
        baseX: 0.18,
        baseY: 0.28,
        color: "rgba(124, 58, 237, 0.09)", // Deep violet gas
        baseRadius: 0.4,
        pulseSpeed: 0.0003,
        pulsePhase: 0,
        driftSpeedX: 0.00012,
        driftSpeedY: 0.00008,
      },
      {
        baseX: 0.82,
        baseY: 0.68,
        color: "rgba(34, 211, 238, 0.08)", // Cyan / turquoise cloud
        baseRadius: 0.44,
        pulseSpeed: 0.00022,
        pulsePhase: Math.PI / 3,
        driftSpeedX: -0.00009,
        driftSpeedY: 0.00011,
      },
      {
        baseX: 0.52,
        baseY: 0.48,
        color: "rgba(255, 45, 120, 0.06)", // Kyber pink gas
        baseRadius: 0.34,
        pulseSpeed: 0.00026,
        pulsePhase: Math.PI * 1.5,
        driftSpeedX: 0.00006,
        driftSpeedY: -0.00008,
      }
    ];

    // Pre-allocate shooting stars Object Pool to avoid dynamic allocations & garbage collection
    const MAX_SHOOTING_STARS = 6;
    const shootingStarPool = [];
    for (let i = 0; i < MAX_SHOOTING_STARS; i++) {
      shootingStarPool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        length: 0,
        color: "",
        life: 0,
        decay: 0
      });
    }

    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollYRef.current = currentY;

      const now = Date.now();
      const dt = Math.max(1, now - lastScrollTime.current);
      const dy = Math.abs(currentY - lastScrollY.current);
      const instantVel = dy / dt; // speed in px/ms

      // Soft ceiling clamp on the scrolling velocity
      const capped = Math.min(instantVel * 1.4, 7.0);
      velocityRef.current = capped;

      lastScrollY.current = currentY;
      lastScrollTime.current = now;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Smooth deceleration to 0 when scrolling halts
      scrollTimeout.current = setTimeout(() => {
        velocityRef.current = 0;
      }, 140);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now();

      // Deep space abyss dark gradient layer
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, width, height);

      // Smooth velocity interpolation for the lightspeed stretch transition
      smoothedVelocityRef.current += (velocityRef.current - smoothedVelocityRef.current) * 0.12;
      
      if (velocityRef.current === 0 && smoothedVelocityRef.current > 0) {
        smoothedVelocityRef.current *= 0.86;
        if (smoothedVelocityRef.current < 0.01) {
          smoothedVelocityRef.current = 0;
        }
      }

      const smoothedV = smoothedVelocityRef.current;

      // 1. Draw slowly drifting glowing Nebulae using pre-allocated structures
      ctx.globalCompositeOperation = "screen";

      const scrollHeight = document.documentElement.scrollHeight || 3000;
      const clientHeight = window.innerHeight;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      const scrollPct = Math.min(1, Math.max(0, scrollYRef.current / maxScroll));

      const nebulae = nebulaeRef.current;
      const numNebulae = nebulae.length;
      for (let idx = 0; idx < numNebulae; idx++) {
        const neb = nebulae[idx];
        const pulse = 1 + 0.14 * Math.sin(time * neb.pulseSpeed * speed + neb.pulsePhase);
        const radius = Math.max(width, height) * neb.baseRadius * pulse;
        
        const driftX = Math.sin(time * neb.driftSpeedX * speed) * width * 0.05;
        const driftY = Math.cos(time * neb.driftSpeedY * speed) * height * 0.05;
        const cx = neb.baseX * width + driftX;
        // Multi-layered subtle parallax depth reaction to user scrolling
        const parallaxFactor = 0.03 + idx * 0.025;
        const cy = neb.baseY * height + driftY - scrollYRef.current * parallaxFactor;

        const nebColor = getSystemColorString(idx, scrollPct, 1.0);
        const fadeColor = getSystemColorString(idx, scrollPct, 0.35);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, nebColor);
        grad.addColorStop(0.5, fadeColor);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = "source-over";

      // 2. Spawn and update high-quality Canvas-based Shooting Stars from the pre-allocated Object Pool
      if (Math.random() < 0.003) {
        // Find an inactive star from the pool
        for (let i = 0; i < MAX_SHOOTING_STARS; i++) {
          const ss = shootingStarPool[i];
          if (!ss.active) {
            const isCyan = Math.random() > 0.45;
            ss.active = true;
            ss.x = Math.random() * width * 0.85 + width * 0.05;
            ss.y = Math.random() * height * 0.28;
            ss.vx = -5.0 - Math.random() * 4.0;
            ss.vy = 4.0 + Math.random() * 4.0;
            ss.length = 120 + Math.random() * 100;
            ss.color = isCyan ? "56, 189, 248" : "244, 114, 182"; // Cyan or pink
            ss.life = 1.0;
            ss.decay = 0.012 + Math.random() * 0.012;
            break;
          }
        }
      }

      // Update & render active shooting stars in a zero-allocation loop
      for (let i = 0; i < MAX_SHOOTING_STARS; i++) {
        const ss = shootingStarPool[i];
        if (!ss.active) continue;

        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;

        if (ss.life <= 0) {
          ss.active = false;
          continue;
        }

        // Draw shooting star as a single clean high-speed dot with radial gradient blur
        const radius = 6 + ss.life * 12;
        const grad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
        grad.addColorStop(0.25, `rgba(${ss.color}, ${ss.life * 0.85})`);
        grad.addColorStop(0.65, `rgba(${ss.color}, ${ss.life * 0.25})`);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Stars Layer with Parallax & Scroll-Triggered Hyperspace streak stretch using fast indices
      const stars = starsRef.current;
      const numStars = stars.length;
      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        const rawY = star.y * height - scrollYRef.current * star.parallaxFactor;
        const starX = star.x * width;
        const starY = (rawY % height + height) % height; // Seamless wrap

        const twinkle = 0.4 + 0.6 * Math.sin(time * star.twinkleSpeed * speed + star.twinklePhase);
        const opacity = star.baseOpacity * twinkle;

        if (smoothedV > 0.06) {
          // Elongate stars vertically because user is scrolling
          const stretchFactor = smoothedV * star.parallaxFactor * 105;
          const tailY = starY - stretchFactor;

          const grad = ctx.createLinearGradient(starX, tailY, starX, starY);
          grad.addColorStop(0, "transparent");
          if (star.color === "#ffffff") {
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.45})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
          } else if (star.color === "#38bdf8") {
            grad.addColorStop(0.5, `rgba(56, 189, 248, ${opacity * 0.45})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
          } else if (star.color === "#f472b6") {
            grad.addColorStop(0.5, `rgba(244, 114, 182, ${opacity * 0.45})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
          } else {
            grad.addColorStop(0.5, `${star.color}40`);
            grad.addColorStop(1, "#ffffff");
          }

          ctx.strokeStyle = grad;
          ctx.lineWidth = star.size * (1 + smoothedV * 0.08);
          ctx.beginPath();
          ctx.moveTo(starX, starY);
          ctx.lineTo(starX, tailY);
          ctx.stroke();

          // Intense hyper-bright white streak core line
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = Math.max(0.6, star.size * 0.35);
          ctx.beginPath();
          ctx.moveTo(starX, starY);
          ctx.lineTo(starX, tailY);
          ctx.stroke();

        } else {
          // Standard twinkling circular stars
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Update FPS calculation
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsUpdateRef.current >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
        setFps(calculatedFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resizeCanvas);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="deep-space-thrum" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* High-Resolution Animated space background canvas */}
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* FPS Monitoring Component */}
      <div style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        background: "rgba(10, 22, 40, 0.8)",
        border: "1px solid rgba(20, 184, 166, 0.3)",
        borderRadius: "30px",
        padding: "5px 12px",
        fontSize: "11px",
        color: fps >= 55 ? "#10F5A0" : fps >= 30 ? "#FBBF24" : "#EF4444",
        fontWeight: "700",
        boxShadow: fps >= 55 ? "0 0 10px rgba(16, 245, 160, 0.2)" : "none",
        zIndex: 9999,
        pointerEvents: "auto",
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)"
      }}>
        <span style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: fps >= 55 ? "#10F5A0" : fps >= 30 ? "#FBBF24" : "#EF4444",
          boxShadow: fps >= 55 ? "0 0 6px #10F5A0" : "none"
        }} />
        <span>PERF: {fps} FPS</span>
      </div>

      {/* Imperial Star Destroyer (Looming background sentinel) */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        left: "3%",
        opacity: 0.08,
        transform: "scale(1.1)",
        animation: "floatShip1 36s ease-in-out infinite",
        filter: "drop-shadow(0 0 15px rgba(255,255,255,0.05))"
      }}>
        <StarDestroyerSVG width="220" height="130" />
      </div>

      {/* Star Wars Space Chase: TIE Fighter (being chased!) */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 5
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          animation: "spaceChaseTIE 18s linear infinite",
          animationDelay: "3s"
        }}>
          <TieFighterSVG width="85" height="90" />
        </div>

        {/* Star Wars Space Chase: X-Wing (doing the chasing & firing!) */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          animation: "spaceChaseXWing 18s linear infinite",
          animationDelay: "3.4s"
        }}>
          <XWingSVG width="95" height="90" />
        </div>
      </div>

      {/* Independent Gliding TIE Fighter (Glides periodically) */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        animation: "tieGlide 22s linear infinite",
        animationDelay: "4s",
        filter: "drop-shadow(0 0 15px rgba(16, 245, 160, 0.15))",
        zIndex: 4
      }}>
        <TieFighterSVG width="70" height="75" />
      </div>

      {/* Independent Climbing X-Wing (Emerges from bottom-right corner) */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        animation: "xWingClimb 26s linear infinite",
        animationDelay: "10s",
        filter: "drop-shadow(0 0 15px rgba(239, 68, 68, 0.2))",
        zIndex: 4
      }}>
        <XWingSVG width="80" height="75" />
      </div>

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
  const onChange=v=>{setText(v);setSaved(false);clearTimeout(timer.current);timer.current=setTimeout(()=>{ls.set(`rmx_cs_${storeKey}`,v);setSaved(true);window.triggerCloudSync?.();},700);};
  const save=()=>{ls.set(`rmx_cs_${storeKey}`,text);setSaved(true);setEditing(false);window.triggerCloudSync?.();};
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
          {hasContent&&!editing&&<button className="rm-btn" onClick={()=>{setText("");ls.set(`rmx_cs_${storeKey}`,"");window.triggerCloudSync?.();}} style={{padding:"3px 7px",borderRadius:"5px",background:"transparent",border:`1px solid ${BDR}`,color:T3,fontSize:"10px"}}>✕</button>}
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
    window.triggerCloudSync?.();
  };
  const remove=id=>{const next=items.filter(r=>r.id!==id);setItems(next);ls.set(`rmx_res_${monthNum}`,next);window.triggerCloudSync?.();};
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

function CyberCat({ eyeOffset, expression = "idle" }) {
  // Determine eye color and glow color based on current expression state
  let eyeColor = "#22D3EE"; // idle: cyan
  if (expression === "thinking") {
    eyeColor = "#FBBF24"; // thinking: amber/gold
  } else if (expression === "happy") {
    eyeColor = "#10F5A0"; // happy: emerald
  } else if (expression === "typing") {
    eyeColor = "#EC4899"; // typing: magenta/pink
  }

  const isHappy = expression === "happy";
  const isThinking = expression === "thinking";
  const isTyping = expression === "typing";

  // Assign pupil style/animation based on expression state
  let pupilStyle = {};
  if (isThinking) {
    pupilStyle = { animation: "thinkingPupil 1.5s linear infinite" };
  } else if (isTyping) {
    pupilStyle = { animation: "pupilRead 0.8s ease-in-out infinite" };
  } else {
    pupilStyle = { transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` };
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes catHop {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px) scaleY(1.04); }
          50% { transform: translateY(-12px) scaleY(0.98); }
          75% { transform: translateY(-3px) scaleY(0.95); }
        }
        @keyframes thinkingPupil {
          0% { transform: translate(0, 0); }
          25% { transform: translate(2.2px, -1px); }
          50% { transform: translate(0, 2.2px); }
          75% { transform: translate(-2.2px, -1px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pupilRead {
          0%, 100% { transform: translate(-1.8px, 2px); }
          50% { transform: translate(1.8px, 2px); }
        }
      `}</style>
      <svg 
        width="44" 
        height="44" 
        viewBox="0 0 60 60" 
        style={{ 
          overflow: "visible",
          animation: isHappy ? "catHop 0.6s cubic-bezier(0.25, 1, 0.5, 1) infinite" : "none"
        }} 
        className="drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]"
      >
        <defs>
          <filter id="cat-cyber-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Swaying Tail */}
        <path 
          d="M 15 50 Q 5 45 8 32 Q 10 25 5 20" 
          fill="none" 
          stroke="#8B5A2B" 
          strokeWidth="4.5" 
          strokeLinecap="round"
          style={{
            transformOrigin: "15px 50px",
            animation: "swayTail 2.8s ease-in-out infinite alternate"
          }}
        />
        {/* Cyber highlight on tail tip */}
        <circle
          cx="5"
          cy="20"
          r="3.2"
          fill={eyeColor}
          filter="url(#cat-cyber-glow)"
          style={{
            transformOrigin: "15px 50px",
            animation: "swayTail 2.8s ease-in-out infinite alternate",
            transition: "fill 0.25s ease"
          }}
        />

        {/* Seated Body */}
        <path d="M 15 52 Q 22 35 30 35 Q 38 35 45 52 Z" fill="#8B5A2B" />
        {/* Back paws */}
        <ellipse cx="18" cy="52" rx="4" ry="2.5" fill="#704214" />
        <ellipse cx="42" cy="52" rx="4" ry="2.5" fill="#704214" />
        {/* Front paws */}
        <ellipse cx="26" cy="53" rx="3.5" ry="2" fill="#5C3A21" />
        <ellipse cx="34" cy="53" rx="3.5" ry="2" fill="#5C3A21" />

        {/* Head Group (Slight breathing translation) */}
        <g style={{ animation: "breatheHead 3.5s ease-in-out infinite alternate", transformOrigin: "30px 30px" }}>
          {/* Left Ear */}
          <polygon points="12,18 21,4 23,18" fill="#704214" />
          <polygon points="14,16 19,7 20,16" fill={eyeColor} filter="url(#cat-cyber-glow)" opacity="0.9" style={{ transition: "fill 0.25s ease" }} />
          
          {/* Right Ear */}
          <polygon points="48,18 39,4 37,18" fill="#704214" />
          <polygon points="46,16 41,7 40,16" fill={eyeColor} filter="url(#cat-cyber-glow)" opacity="0.9" style={{ transition: "fill 0.25s ease" }} />

          {/* Head Circle */}
          <circle cx="30" cy="22" r="14" fill="#8B5A2B" />
          
          {/* Cyber temple plate lines */}
          <path d="M 18 20 L 22 20" stroke={eyeColor} strokeWidth="1" filter="url(#cat-cyber-glow)" style={{ transition: "stroke 0.25s ease" }} />
          <path d="M 42 20 L 38 20" stroke={eyeColor} strokeWidth="1" filter="url(#cat-cyber-glow)" style={{ transition: "stroke 0.25s ease" }} />

          {/* Left Eye Socket */}
          <circle cx="23" cy="21" r="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          {/* Left Pupil (Moves!) */}
          <g style={pupilStyle}>
            {isHappy ? (
              <path d="M 21 22.5 Q 23 20 25 22.5" fill="none" stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" filter="url(#cat-cyber-glow)" />
            ) : (
              <>
                <circle cx="23" cy="21" r="2.8" fill={eyeColor} filter="url(#cat-cyber-glow)" style={{ transition: "fill 0.25s ease" }} />
                <circle cx="21.8" cy="19.8" r="0.8" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Right Eye Socket */}
          <circle cx="37" cy="21" r="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          {/* Right Pupil (Moves!) */}
          <g style={pupilStyle}>
            {isHappy ? (
              <path d="M 35 22.5 Q 37 20 39 22.5" fill="none" stroke={eyeColor} strokeWidth="2.2" strokeLinecap="round" filter="url(#cat-cyber-glow)" />
            ) : (
              <>
                <circle cx="37" cy="21" r="2.8" fill={eyeColor} filter="url(#cat-cyber-glow)" style={{ transition: "fill 0.25s ease" }} />
                <circle cx="35.8" cy="19.8" r="0.8" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Nose & Mouth */}
          <polygon points="29,25 31,25 30,26.5" fill="#5C3A21" />
          <path d="M 28 27 Q 30 28.5 30 27 Q 30 28.5 32 27" fill="none" stroke="#5C3A21" strokeWidth="1" />

          {/* Metallic Whiskers */}
          <path d="M 16 25 L 7 24" stroke="#475569" strokeWidth="1.2" />
          <path d="M 16 27 L 5 28" stroke="#475569" strokeWidth="1.2" />
          <path d="M 44 25 L 53 24" stroke="#475569" strokeWidth="1.2" />
          <path d="M 44 27 L 55 28" stroke="#475569" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

function SidebarChatbot({ 
  aiMessages, 
  aiLoading, 
  handleSendAiMessage, 
  highThinkingEnabled, 
  setHighThinkingEnabled,
  audioEnabled
}) {
  const [leftInput, setLeftInput] = useState("");
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [chatGlassMode, setChatGlassMode] = useState(() => {
    return localStorage.getItem("rmx_chat_glass_mode") || "dark";
  });
  const [catExpression, setCatExpression] = useState("idle");
  const catRef = useRef(null);
  const scrollRef = useRef(null);
  const prevMsgCount = useRef(aiMessages.length);

  // Mouse tracking to feed cursor angle to cyber cat eyes
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!catRef.current) return;
      const rect = catRef.current.getBoundingClientRect();
      const catX = rect.left + rect.width / 2;
      const catY = rect.top + rect.height / 2;
      const dx = e.clientX - catX;
      const dy = e.clientY - catY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const maxLimit = 3.5;
      if (distance === 0) {
        setEyeOffset({ x: 0, y: 0 });
      } else {
        const scale = Math.min(maxLimit, distance / 35);
        const angle = Math.atan2(dy, dx);
        setEyeOffset({
          x: Math.cos(angle) * scale,
          y: Math.sin(angle) * scale
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track message updates to trigger "happy" cat expression
  useEffect(() => {
    if (aiMessages.length > prevMsgCount.current) {
      setCatExpression("happy");
      const timer = setTimeout(() => {
        setCatExpression("idle");
      }, 3000);
      prevMsgCount.current = aiMessages.length;
      return () => clearTimeout(timer);
    }
    prevMsgCount.current = aiMessages.length;
  }, [aiMessages.length]);

  // Keep scroll focused on newest system trace
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // Resolve current active expression
  let currentExpression = catExpression;
  if (aiLoading) {
    currentExpression = "thinking";
  } else if (leftInput.trim().length > 0 && currentExpression !== "happy") {
    currentExpression = "typing";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leftInput.trim() || aiLoading) return;
    handleSendAiMessage(leftInput);
    setLeftInput("");
  };

  const handleThemeToggle = () => {
    const nextMode = chatGlassMode === "dark" ? "light" : "dark";
    setChatGlassMode(nextMode);
    localStorage.setItem("rmx_chat_glass_mode", nextMode);
    try { playSuccessBeep(audioEnabled); } catch (e) {}
  };

  // Glassmorphic Theme configuration matrices
  const isLight = chatGlassMode === "light";
  const bgStyle = isLight 
    ? "rgba(255, 255, 255, 0.72)" 
    : "rgba(10, 22, 40, 0.45)";
  const borderStyle = isLight 
    ? "1.5px solid rgba(15, 23, 42, 0.12)" 
    : "1.5px solid rgba(255, 255, 255, 0.08)";
  const shadowStyle = isLight
    ? "0 10px 30px -5px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
    : "0 10px 30px -5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)";
  const headerTextColor = isLight ? "text-slate-900" : "text-white";
  const subTextColor = isLight ? "text-slate-500 font-medium" : "text-slate-400";
  const primaryAccentColor = isLight ? "#7C3AED" : "#22D3EE";
  const userBubbleStyle = isLight
    ? "bg-purple-600/10 border border-purple-600/20 text-purple-950 font-medium"
    : "bg-[#A78BFA]/15 border border-[#A78BFA]/25 text-white";
  const copilotBubbleStyle = isLight
    ? "bg-slate-200/65 border border-slate-300/40 text-slate-800"
    : "bg-white/5 border border-white/5 text-slate-300";
  const inputBgClass = isLight
    ? "bg-white/90 border-slate-300/70 text-slate-900 placeholder:text-slate-400 focus:border-purple-500/60"
    : "bg-slate-950/60 border-white/5 text-white placeholder:text-slate-600 focus:border-[#A78BFA]/30";
  const footerBtnClass = isLight
    ? "bg-slate-100 hover:bg-slate-200 border-slate-300/60 text-slate-600"
    : "border-white/5 bg-transparent text-slate-500";

  return (
    <div style={{
      background: bgStyle,
      border: borderStyle,
      borderRadius: "18px",
      padding: "16px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: shadowStyle,
      transition: "background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease"
    }} className="flex flex-col relative overflow-hidden">
      
      {/* Decorative background glow node */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: isLight ? "rgba(124, 58, 237, 0.08)" : "rgba(167, 139, 250, 0.08)" }}
      />

      {/* Header controls layout */}
      <div className="flex items-center justify-between mb-3 border-b border-black/5 dark:border-white/5 pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors" 
              style={{ backgroundColor: primaryAccentColor }}
            />
            <span style={{ fontSize: "10px", color: primaryAccentColor, fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", transition: "color 0.3s" }}>
              SYSTEMS AI COPILOT
            </span>
          </div>
          <span style={{ fontSize: "11px", marginTop: "1px" }} className={subTextColor}>
            Real-time Assistant
          </span>
        </div>

        {/* Theme and Cat row */}
        <div className="flex items-center gap-2.5">
          {/* Glass Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`p-1.5 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-sm ${
              isLight
                ? "bg-white/80 hover:bg-white border-slate-200 text-purple-600"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-yellow-400"
            }`}
            title={isLight ? "Switch to Dark glassmorphism mode" : "Switch to Light glassmorphism mode"}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Eye tracking Cat element */}
          <div ref={catRef} title={`Cyber-Cat: ${currentExpression.toUpperCase()}`} className="cursor-help transform hover:scale-105 transition-transform duration-200">
            <CyberCat eyeOffset={eyeOffset} expression={currentExpression} />
          </div>
        </div>
      </div>

      {/* Scrollable message container */}
      <div 
        ref={scrollRef}
        style={{
          height: "220px",
          overflowY: "auto",
          fontSize: "10.5px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingRight: "4px"
        }}
        className="no-scrollbar mb-3"
      >
        {aiMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <span className="text-[7px] font-mono text-slate-500 mb-0.5 tracking-wider uppercase">
              {msg.role === "user" ? "YOU" : "COPILOT"}
            </span>
            <div
              className={`max-w-[90%] rounded-xl p-2.5 font-mono leading-relaxed select-text shadow-sm transition-colors ${
                msg.role === "user" ? userBubbleStyle : copilotBubbleStyle
              }`}
              style={{ wordBreak: "break-word" }}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[7px] font-mono text-[#A78BFA] mb-0.5 tracking-wider uppercase">
              SYNTHESIZING...
            </span>
            <div className={`rounded-xl p-2 text-[10px] font-mono flex items-center gap-1.5 border ${isLight ? "bg-purple-100/60 text-purple-700 border-purple-200" : "bg-[#A78BFA]/5 border-[#A78BFA]/10 text-[#A78BFA]"}`}>
              <span className="flex h-1 w-1 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLight ? "bg-purple-600" : "bg-[#A78BFA]"}`}></span>
                <span className={`relative inline-flex rounded-full h-1 w-1 ${isLight ? "bg-purple-600" : "bg-[#A78BFA]"}`}></span>
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub-bar buttons */}
      <div className="flex items-center justify-between mb-2.5 text-[8px] font-mono text-slate-400">
        <button
          type="button"
          onClick={() => {
            setHighThinkingEnabled(!highThinkingEnabled);
            try { playSweepSound(audioEnabled, !highThinkingEnabled); } catch (e) {}
          }}
          className={`px-2 py-0.5 rounded border transition-all ${
            highThinkingEnabled 
              ? "bg-[#A78BFA]/10 border-[#A78BFA]/25 text-[#A78BFA] font-bold" 
              : "border-black/5 dark:border-white/5 bg-transparent text-slate-500"
          }`}
        >
          🧠 {highThinkingEnabled ? "REASONING ACTIVE" : "FAST MODE"}
        </button>
        
        <button
          type="button"
          onClick={() => {
            if(confirm("Clear chat conversation?")) {
              const resetMsgs = [
                {
                  role: "model",
                  parts: [{ text: "Chat history cleared. How can I assist you with low-level systems engineering or database optimization today?" }]
                }
              ];
              setAiMessages(resetMsgs);
              localStorage.setItem("rmx_ai_messages", JSON.stringify(resetMsgs));
            }
          }}
          className="hover:text-red-400 font-bold transition-colors"
        >
          🗑 CLEAR HISTORY
        </button>
      </div>

      {/* Message submit form */}
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="text"
          value={leftInput}
          onChange={e => setLeftInput(e.target.value)}
          disabled={aiLoading}
          placeholder="Ask systems copilot..."
          className={`flex-1 border rounded-xl px-2.5 py-1.5 text-[11px] font-mono transition-all disabled:opacity-50 ${inputBgClass}`}
        />
        <button
          type="submit"
          disabled={!leftInput.trim() || aiLoading}
          className="p-2 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] hover:brightness-110 disabled:opacity-40 text-black font-black flex items-center justify-center transition-all duration-200 shadow-md"
        >
          <Send size={11} className="text-black stroke-[3px]" />
        </button>
      </form>
    </div>
  );
}

function SidebarAcademy({
  customAcademyTopic,
  setCustomAcademyTopic,
  lessonData,
  setLessonData,
  lessonLoading,
  handleGenerateLesson,
  selectedAnswers,
  setSelectedAnswers,
  quizSubmitted,
  setQuizSubmitted,
  editableNotes,
  setEditableNotes,
  notesSavedStatus,
  handleSaveLessonNotes,
  audioEnabled
}) {
  return (
    <div style={{
      background: "rgba(10, 22, 40, 0.45)",
      border: "1.5px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "18px",
      padding: "16px",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 10px 30px -5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
    }} className="flex flex-col relative overflow-hidden">
      
      {/* Decorative background glow node */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none" 
        style={{ backgroundColor: "rgba(167, 139, 250, 0.06)" }}
      />

      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span style={{ fontSize: "10px", color: "#A78BFA", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              SYSTEMS ACADEMY
            </span>
          </div>
          <span style={{ fontSize: "11px", marginTop: "1px" }} className="text-slate-400 font-medium">
            Interactive Classroom
          </span>
        </div>
        <span className="text-xs">🎓</span>
      </div>

      {/* Systems Academy Topic Picker or Lesson Viewer */}
      {!lessonData && !lessonLoading ? (
        <div className="space-y-4">
          <p className="text-[10.5px] font-mono text-slate-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
            Select a high-performance system curriculum or define your own. The oracle will generate deep-dive lessons, interactive checkpoint quizzes, and saveable cheat sheets!
          </p>

          <div className="space-y-2">
            <span className="text-[8.5px] font-mono font-black tracking-[0.15em] text-[#A78BFA]/85 uppercase">CURRICULUM PRESETS:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: "🐳 Docker Isolation & namespaces", topic: "Docker Namespaces and cgroups Process Isolation" },
                { label: "💾 Postgres Shared & Exclusive Locks", topic: "PostgreSQL Shared and Exclusive Locks, Row-Level locks, and Deadlocks" },
                { label: "⚡ CPU Caches & Spatial Locality", topic: "CPU Cache Lines, Spatial & Temporal Locality, Cache Bouncing" },
                { label: "📊 Analyzing Postgres EXPLAIN Plans", topic: "Analyzing Postgres Query Plans with EXPLAIN ANALYZE" },
                { label: "🧱 Virtual Memory & OS mmap allocation", topic: "Operating System Page Tables, Virtual Memory, and mmap memory allocation" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateLesson(item.topic)}
                  className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/3 hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/25 text-[10.5px] font-mono text-slate-300 hover:text-white transition-all duration-200 shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-[8.5px] font-mono font-black tracking-[0.15em] text-[#A78BFA]/85 uppercase">DEFINE CUSTOM SYLLABUS:</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customAcademyTopic}
                onChange={e => setCustomAcademyTopic(e.target.value)}
                placeholder="e.g. TCP Slow Start, Rust lifetimes..."
                className="flex-1 min-w-0 bg-slate-950/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#A78BFA]/40 transition-all"
              />
              <button
                onClick={() => handleGenerateLesson()}
                disabled={!customAcademyTopic.trim()}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:brightness-110 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black font-mono text-[11px] transition-all duration-200 shadow-md"
              >
                STUDY
              </button>
            </div>
          </div>
        </div>
      ) : lessonLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 font-mono">
          <RefreshCw className="w-6 h-6 text-[#A78BFA] animate-spin" />
          <div className="text-center text-[10px] text-[#A78BFA] animate-pulse uppercase tracking-wider font-black">
            COMPILING LESSON...
          </div>
          <div className="text-[8.5px] text-slate-500 text-center max-w-xs leading-relaxed">
            The reasoning engine is generating system-level documentation, checkpoint quizzes, and pristine study notes.
          </div>
        </div>
      ) : (
        <div className="space-y-4 select-text">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-[10.5px] font-bold font-mono text-[#A78BFA] uppercase truncate flex-1 pr-2" title={lessonData.title}>
              🎓 {lessonData.title}
            </h4>
            <button
              onClick={() => setLessonData(null)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#A78BFA]/30 text-slate-300 hover:text-white font-mono text-[8.5px] tracking-wider transition-all duration-200 shadow-sm"
            >
              RESET
            </button>
          </div>

          {/* Section 1: Lecture Guide */}
          <div className="rounded-xl border border-white/5 p-3.5 space-y-2 bg-slate-950/20 max-h-[220px] overflow-y-auto no-scrollbar">
            <div className="text-[9px] font-mono font-black text-[#A78BFA] tracking-[0.12em] uppercase flex items-center gap-1">
              <span>📖</span> SECTION 1: LECTURE GUIDE
            </div>
            <div className="text-[10.5px] font-sans text-slate-300 leading-relaxed">
              <Md text={lessonData.lessonContent} color="#A78BFA" />
            </div>
          </div>

          {/* Section 2: Checkpoint Quiz */}
          <div className="rounded-xl border border-white/5 p-3.5 space-y-3 bg-slate-950/20 max-h-[220px] overflow-y-auto no-scrollbar">
            <div className="text-[9px] font-mono font-black text-[#A78BFA] tracking-[0.12em] uppercase flex items-center gap-1">
              <span>📝</span> SECTION 2: CHECKPOINT QUIZ
            </div>
            {lessonData.quizQuestions && lessonData.quizQuestions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              return (
                <div key={qIdx} className="space-y-2 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                  <div className="text-[10px] font-mono font-semibold text-slate-200 leading-normal">
                    Q{qIdx + 1}: {q.question}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:border-[#A78BFA]/20";
                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold";
                        } else if (optIdx === selectedOpt) {
                          btnStyle = "border-red-500/50 bg-red-500/10 text-red-400";
                        } else {
                          btnStyle = "border-white/5 bg-transparent text-slate-500 opacity-60";
                        }
                      } else if (selectedOpt === optIdx) {
                        btnStyle = "border-[#A78BFA] bg-[#A78BFA]/10 text-white font-bold";
                      }
                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => {
                            setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                            playSuccessBeep(audioEnabled);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border text-[9.5px] font-mono transition-all duration-200 ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="text-[8.5px] font-mono text-slate-400 bg-slate-950/40 border border-white/5 p-2.5 rounded-xl leading-relaxed mt-1">
                      <span className="font-bold block mb-1 text-slate-300">
                        {selectedOpt === q.correctIndex ? "✅ Correct!" : "❌ Incorrect."}
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
            
            {!quizSubmitted ? (
              <button
                onClick={() => {
                  setQuizSubmitted(true);
                  playSuccessBeep(audioEnabled);
                }}
                disabled={Object.keys(selectedAnswers).length < (lessonData.quizQuestions?.length || 3)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 disabled:opacity-40 text-black font-black font-mono text-[10px] transition-all duration-200 shadow-md"
              >
                SUBMIT ANSWERS
              </button>
            ) : (
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setSelectedAnswers({});
                }}
                className="w-full py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] transition-all duration-200 shadow-sm"
              >
                RETRY QUIZ
              </button>
            )}
          </div>

          {/* Section 3: Study Notes */}
          <div className="rounded-xl border border-white/5 p-3.5 space-y-3 bg-slate-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-black text-[#A78BFA] tracking-[0.12em] uppercase flex items-center gap-1">
                <span>📋</span> SECTION 3: NOTES SUMMARY
              </span>
            </div>
            <textarea
              value={editableNotes}
              onChange={e => setEditableNotes(e.target.value)}
              rows={4}
              className="w-full bg-slate-950/40 border border-white/10 rounded-xl p-2.5 text-[9.5px] font-mono text-slate-200 focus:outline-none focus:border-[#A78BFA]/40 resize-y leading-relaxed shadow-inner"
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleSaveLessonNotes}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:brightness-110 text-black text-[10px] font-mono font-black transition-all duration-200 shadow-md"
              >
                <span>💾</span> {notesSavedStatus === "saved" ? "SAVED!" : notesSavedStatus === "saving" ? "SAVING..." : "SAVE CHEATS"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(editableNotes);
                  playSuccessBeep(audioEnabled);
                }}
                className="px-3 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9.5px] transition-all duration-200 shadow-sm"
              >
                COPY
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setLessonData(null);
              playSuccessBeep(audioEnabled);
            }}
            className="w-full py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[9px] tracking-widest uppercase transition-all duration-200 shadow-sm"
          >
            ⬅️ BACK TO ACADEMY
          </button>
        </div>
      )}
    </div>
  );
}

function Pomodoro(){
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
    <div style={{
      background: CARD,
      border: `1px solid ${BDR}`,
      borderRadius: "16px",
      padding: "20px",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)"
    }}>
      <div style={{ fontSize: "10px", color: ac, fontWeight: "800", letterSpacing: "1.5px", marginBottom: "14px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>⏱️ {isBreak ? "REST INTERVAL" : "DEEP WORK SESSION"}</span>
        <span style={{ fontSize: "9px", background: `${ac}15`, padding: "2px 6px", borderRadius: "4px", color: ac, fontWeight: "700" }}>
          {running ? "ACTIVE" : "PAUSED"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
          <Ring p={prog} color={ac} size={64} stroke={4.5} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="mono" style={{ fontSize: "13px", fontWeight: "700", color: T1 }}>
              {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: T2, fontWeight: "600", lineHeight: "1.4" }}>
            {isBreak ? "Take a breath, stand up, stretch." : "Focus entirely on your roadmap study."}
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
            <button className="rm-btn" onClick={() => setRunning(!running)} style={{ padding: "4px 12px", borderRadius: "6px", background: `${ac}15`, border: `1px solid ${ac}35`, color: ac, fontSize: "11px", fontWeight: "700" }}>
              {running ? "Pause" : "Start"}
            </button>
            <button className="rm-btn" onClick={() => { setRunning(false); setLeft(25 * 60); setIsBreak(false); }} style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: `1px solid ${BDR2}`, color: T3, fontSize: "10px" }}>
              Reset
            </button>
          </div>
        </div>
      </div>
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
    window.triggerCloudSync?.();
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

function ModuleFocusedReader({
  activeMonth,
  onClose,
  done,
  toggleDone,
  toggleTopicDone,
  markAll,
  resetMonth,
  bkm,
  toggleBkm,
  searchQuery,
  selectedDiff,
  selectedDomain,
  setActiveNoteMonth,
  resOpen,
  setResOpen,
  csOpen,
  setCsOpen
}) {
  if (!activeMonth) return null;
  const monthData = MONTHS.find(m => m.month === activeMonth);
  if (!monthData) return null;
  
  const ph = PHASES[monthData.phase - 1];
  const p = pct(monthData, done);
  const comp = doneItems(monthData, done);
  const tot = totalItems(monthData);
  const isBkm = bkm[monthData.month];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1500,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "backdropFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
    }} onClick={onClose}>
      <div style={{
        width: "100%",
        maxWidth: "920px",
        maxHeight: "90vh",
        background: "rgba(10, 22, 40, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${ph.c}40`,
        borderRadius: "16px",
        boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 35px ${ph.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        position: "relative"
      }} onClick={e => e.stopPropagation()}>
        {/* Top phase colored progress gradient line */}
        <div style={{
          height: "4px",
          background: `linear-gradient(90deg, ${ph.c}, ${ph.c2})`,
          boxShadow: `0 2px 14px ${ph.c}`
        }} />

        {/* Header section with title and actions */}
        <div style={{
          padding: "24px 30px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", color: ph.c, fontWeight: "800", letterSpacing: "2.5px", textTransform: "uppercase" }}>
                {ph.name} · MODULE {activeMonth}
              </span>
              <span style={{
                fontSize: "8px",
                background: `${ph.c}14`,
                border: `1.5px solid ${ph.c}30`,
                borderRadius: "12px",
                padding: "2px 8px",
                color: ph.c2,
                fontWeight: "700"
              }}>
                {ph.full}
              </span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: T1, fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginTop: "6px" }}>
              {highlightText(monthData.title, searchQuery, ph.c)}
            </div>
            <div style={{ fontSize: "11px", color: T3, marginTop: "4px" }}>
              {highlightText(monthData.tag, searchQuery, ph.c)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Ring and Progress percentage */}
            <div style={{ position: "relative" }}>
              <BigRing p={p} color={ph.c} size={54} />
            </div>

            {/* Bookmark button */}
            <button className="rm-btn" onClick={() => toggleBkm(monthData.month)} style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: `1.5px solid ${isBkm ? "#FBBF24" : "rgba(255,255,255,0.08)"}`,
              background: isBkm ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.02)",
              color: isBkm ? "#FBBF24" : T3,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.22s"
            }}>
              {isBkm ? "★" : "☆"}
            </button>

            {/* Close button */}
            <button onClick={onClose} className="rm-btn" style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              color: T2,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.22s"
            }}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable details body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 30px 30px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }} className="no-scrollbar">

          {/* Goal section */}
          <div style={{
            background: `${ph.c}05`,
            border: `1.5px dashed ${ph.c}30`,
            borderRadius: "12px",
            padding: "16px 20px",
            display: "flex",
            gap: "14px",
            alignItems: "flex-start"
          }}>
            <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>🎯</span>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: ph.c, fontWeight: "800", marginBottom: "4px", textTransform: "uppercase" }}>Monthly Objective</div>
              <div style={{ fontSize: "13px", color: T1, lineHeight: 1.7, fontWeight: "500" }}>{highlightText(monthData.goal, searchQuery, ph.c)}</div>
            </div>
          </div>

          {/* Actions toolbar */}
          <div style={{
            display: "flex",
            gap: "10px",
            padding: "12px 18px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "10px",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <div style={{ fontSize: "11px", color: T2, fontWeight: "600" }}>
              Completed <span style={{ color: ph.c, fontWeight: "800", fontSize: "12px" }}>{comp}</span> of <span style={{ color: T1, fontWeight: "800", fontSize: "12px" }}>{tot}</span> steps
            </div>
            <div style={{ flex: 1 }} />
            <button className="rm-btn" onClick={() => setActiveNoteMonth(monthData.month)} style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${BDR2}`, background: "rgba(255,255,255,0.03)", color: T1, fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              📝 Personal Note
            </button>
            <button className="rm-btn" onClick={() => setResOpen(p => ({ ...p, [monthData.month]: !p[monthData.month] }))} style={{ padding: "6px 14px", borderRadius: "6px", border: `1.5px solid ${ph.c}30`, background: `${ph.c}0C`, color: ph.c, fontSize: "11px", fontWeight: "700" }}>
              📚 {resOpen[monthData.month] ? "Hide Resources" : "Show Resources"}
            </button>
            <button className="rm-btn" onClick={() => markAll(monthData.month)} style={{ padding: "6px 14px", borderRadius: "6px", border: `1.5px solid ${ph.c}38`, background: `${ph.c}14`, color: ph.c, fontSize: "11px", fontWeight: "800" }}>
              ✓ Mark Month Complete
            </button>
            <button className="rm-btn" onClick={() => resetMonth(monthData.month)} style={{ padding: "6px 10px", borderRadius: "6px", border: `1px solid ${BDR}`, background: "transparent", color: T3, fontSize: "11px", fontWeight: "600" }}>
              ↺ Reset
            </button>
          </div>

          {/* Persistent Hand-written Note Preview if exists */}
          {(() => {
            const note = ls.get(`rmx_module_notes_${monthData.month}`, "");
            if (!note) return null;
            return (
              <div onClick={() => setActiveNoteMonth(monthData.month)} style={{
                background: "rgba(255,255,255,0.01)",
                border: `1.5px dashed ${ph.c}40`,
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "13px",
                color: T2,
                lineHeight: "1.65",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                transition: "all 0.25s ease",
                boxShadow: `inset 0 0 12px ${ph.c}05`
              }} className="hover:border-indigo-400 group">
                <span style={{ fontSize: "18px", marginTop: "-1px" }}>✍️</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: "800", color: ph.c, fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: "4px" }}>MODULE MEMO</span>
                  <span className="italic" style={{ color: T1 }}>"{note}"</span>
                </div>
                <span style={{ fontSize: "11px", color: T3, alignSelf: "center", fontWeight: "600" }}>Edit Memo ✎</span>
              </div>
            );
          })()}

          {/* Resources panel within the Modal */}
          {resOpen[monthData.month] && <Resources monthNum={monthData.month} color={ph.c} />}

          {/* Topics & Checklists Grid inside Modal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {monthData.topics.map((topic, ti) => {
              const matchesDiff = selectedDiff === "All" || topic.diff === selectedDiff;
              const matchesDom = selectedDomain === "All" || getTopicDomain(topic, monthData) === selectedDomain;
              if (!matchesDiff || !matchesDom) return null;

              const isTopicMatch = !searchQuery.trim() || 
                topic.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
                topic.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase().trim()));
              if (!isTopicMatch) return null;

              const topDone = topic.items.filter((_, ii) => done[`m${monthData.month}_t${ti}_i${ii}`]).length;
              const isAllDone = topDone === topic.items.length;
              const isPartDone = topDone > 0 && topDone < topic.items.length;
              const dc = DIFF_C[topic.diff] || T3;
              const csKey = `${monthData.month}_${ti}`;
              const csIsOpen = csOpen[csKey];

              return (
                <div key={ti} style={{
                  background: "rgba(10, 25, 47, 0.35)",
                  border: `1px solid ${isAllDone ? ph.c + "33" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  position: "relative"
                }}>
                  {/* Topic progress mini-bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2.5px", background: "rgba(255,255,255,0.02)", borderRadius: "12px 12px 0 0" }}>
                    <div style={{ height: "100%", width: `${(topDone / topic.items.length) * 100}%`, background: `linear-gradient(90deg, ${ph.c}, ${ph.c2})`, transition: "width .6s ease" }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", marginTop: "4px" }}>
                    {/* Interactive Topic Checkbox */}
                    <div onClick={(e) => { e.stopPropagation(); toggleTopicDone(monthData.month, ti, topic); }}
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        flexShrink: 0,
                        border: `1.5px solid ${isAllDone ? ph.c : (isPartDone ? `${ph.c}95` : "rgba(255,255,255,0.22)")}`,
                        background: isAllDone ? `${ph.c}20` : (isPartDone ? `${ph.c}0E` : "transparent"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all .2s ease"
                      }}
                      className="rm-check"
                      title={isAllDone ? "Reset whole topic" : "Mark whole topic as completed"}>
                      {isAllDone && <span style={{ fontSize: "10px", color: ph.c, fontWeight: "bold" }}>✓</span>}
                      {isPartDone && <div style={{ width: "6px", height: "1.5px", background: ph.c, borderRadius: "1px" }} />}
                    </div>

                    <div style={{ flex: 1, fontSize: "12px", fontWeight: "800", color: ph.c2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {highlightText(topic.name, searchQuery, ph.c)}
                    </div>
                    <span style={{ fontSize: "8px", fontWeight: "700", color: dc, padding: "2px 8px", background: `${dc}0E`, borderRadius: "4px", border: `1px solid ${dc}22`, letterSpacing: "0.5px" }}>
                      {topic.diff}
                    </span>
                    <span style={{ fontSize: "10px", color: topDone === topic.items.length ? "#10B981" : T3, fontWeight: "700" }}>
                      {topDone}/{topic.items.length} completed
                    </span>
                    <button className="rm-btn" onClick={() => setCsOpen(p => ({ ...p, [csKey]: !p[csKey] }))}
                      style={{ padding: "3px 8px", borderRadius: "5px", background: csIsOpen ? `${ph.c}14` : "rgba(255,255,255,0.04)", border: `1px solid ${csIsOpen ? ph.c + "38" : BDR}`, color: csIsOpen ? ph.c : T3, fontSize: "10px", fontWeight: "600" }}>
                      {csIsOpen ? "▲ Hide notes" : "📋 Cheat sheet"}
                    </button>
                  </div>

                  {/* Sub-items checklist with perfect spacing and high visibility */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {topic.items.map((item, ii) => {
                      const isItemMatch = !searchQuery.trim() || 
                        item.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                        topic.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
                      if (!isItemMatch) return null;
                      const k = `m${monthData.month}_t${ti}_i${ii}`;
                      const isDone = done[k];
                      return (
                        <div key={ii} className="rm-check" style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: isDone ? "rgba(255,255,255,0.01)" : "transparent",
                          transition: "background 0.2s"
                        }} onClick={() => toggleDone(k, monthData.month)}>
                          <div style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "3.5px",
                            flexShrink: 0,
                            marginTop: "3px",
                            border: `1.5px solid ${isDone ? ph.c : "rgba(255,255,255,0.18)"}`,
                            background: isDone ? `${ph.c}20` : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all .18s ease"
                          }}>
                            {isDone && <span style={{ fontSize: "9px", color: ph.c, fontWeight: "bold" }}>✓</span>}
                          </div>
                          <span style={{
                            fontSize: "12px",
                            lineHeight: 1.6,
                            color: isDone ? "rgba(255,255,255,0.3)" : T2,
                            textDecoration: isDone ? "line-through" : "none",
                            transition: "all .18s ease"
                          }}>
                            {highlightText(item, searchQuery, ph.c)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {csIsOpen && <CheatSheet storeKey={csKey} color={ph.c} />}
                </div>
              );
            })}
          </div>

          {/* Footer of the Modal: Parallel Study & Milestones side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginTop: "10px" }}>
            <div style={{ background: "rgba(10, 25, 47, 0.25)", border: `1px solid ${BDR}`, borderRadius: "10px", padding: "16px 18px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: T3, fontWeight: "800", marginBottom: "10px", textTransform: "uppercase" }}>⚡ Parallel This Month</div>
              <div style={{ fontSize: "12px", color: T2, lineHeight: 1.7 }}>{monthData.parallel}</div>
            </div>
            <div style={{ background: "rgba(10, 25, 47, 0.25)", border: `1px solid ${BDR}`, borderRadius: "10px", padding: "16px 18px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: T3, fontWeight: "800", marginBottom: "10px", textTransform: "uppercase" }}>🏆 Milestones</div>
              {monthData.milestones.map((ml, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ color: ph.c, fontSize: "10px", marginTop: "3px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "12px", color: T2, lineHeight: 1.6 }}>{ml}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SYSTEMS LAB: INTERACTIVE CYBERNETIC COGNITIVE WORKSHOP
// ============================================================================

function SystemsLab({ audioEnabled }) {
  const [labTab, setLabTab] = useState("terminal");

  // Global styled theme pointers (accessible directly)
  const colors = {
    cyan: "#22D3EE",
    magenta: "#FF2D78",
    purple: "#7C3AED",
    green: "#10F5A0",
    gold: "#FBBF24"
  };

  // 1. Terminal State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "sys", text: "FLOW_16 COGNITIVE SYSTEMS MAINFRAME // TERMINAL ACTIVE" },
    { type: "sys", text: "COGNITIVE PORT INTEGRATED // STATUS: GREEN" },
    { type: "sys", text: "Type 'help' or click a macro command to analyze system diagnostics, memory heaps, and neural maps." }
  ]);
  const terminalBottomRef = useRef(null);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory]);

  // 2. Memory Allocator State
  const [memoryBlocks, setMemoryBlocks] = useState(() => {
    const arr = Array(32).fill(0); // 0 = Free, 1 = Allocated, 2 = Leaked
    arr[0] = 1; arr[1] = 1; arr[4] = 1; arr[8] = 2; arr[12] = 1; arr[13] = 1; arr[20] = 2;
    return arr;
  });
  const [allocSize, setAllocSize] = useState(2);
  const [allocAlgo, setAllocAlgo] = useState("first-fit");
  const [gcSweeping, setGcSweeping] = useState(false);

  // 3. Neural Net Attention Map Hover State
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [attnSelectedCell, setAttnSelectedCell] = useState(null);

  // 4. Network Simulator State
  const [cdnEnabled, setCdnEnabled] = useState(true);
  const [dbIndexed, setDbIndexed] = useState(true);
  const [networkLogs, setNetworkLogs] = useState([
    "Mainframe core routing engine initialized.",
    "Awaiting dispatch trigger..."
  ]);
  const [routingState, setRoutingState] = useState("idle"); // "idle" | "client_to_lb" | "lb_to_cdn" | "cdn_to_client" | "lb_to_srv" | "srv_to_db" | "db_processing" | "db_to_srv" | "srv_to_client"
  const [activeServer, setActiveServer] = useState("A");
  const [latencyValue, setLatencyValue] = useState(null);

  // Safe sound utilities
  const triggerSuccessBeep = () => {
    try { playSuccessBeep(audioEnabled); } catch (e) {}
  };
  const triggerSweep = (isUp = true) => {
    try { playSweepSound(audioEnabled, isUp); } catch (e) {}
  };

  const handleBlockClick = (index) => {
    setMemoryBlocks(prev => {
      const next = [...prev];
      if (next[index] === 0) {
        next[index] = 1; // Allocate
      } else if (next[index] === 1) {
        next[index] = 2; // Leak
      } else {
        next[index] = 0; // Free
      }
      return next;
    });
    triggerSuccessBeep();
  };

  // Commands Handler
  const executeCommand = (cmdText) => {
    const cmd = cmdText.trim();
    if (!cmd) return;

    const lowerCmd = cmd.toLowerCase().trim();
    let response = [];

    const nextHistory = [...terminalHistory, { type: "input", text: cmd }];

    if (lowerCmd === "help") {
      response = [
        { type: "info", text: "AVAILABLE COGNITIVE SYSTEMS COMMANDS:" },
        { type: "info", text: "  sysinfo       - Display spacecraft physical core specs & cache alignment" },
        { type: "info", text: "  diagnostics   - Run deep diagnostic sweep across sectors & core workloads" },
        { type: "info", text: "  alloc <num>   - Allocate 'num' contiguous blocks in virtual memory heap" },
        { type: "info", text: "  explain <key> - Query systems documentation (e.g. 'mmap', 'attention', 'hnsw')" },
        { type: "info", text: "  git commit    - Trigger database sublight git DAG commit node" },
        { type: "info", text: "  clear         - Wipe terminal memory log" }
      ];
      triggerSuccessBeep();
    } else if (lowerCmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else if (lowerCmd === "sysinfo") {
      response = [
        { type: "info", text: " " },
        { type: "success", text: "  🛰️  VESSEL ARCHITECTURE: COGNITIVE SILICON CORE V16-RT" },
        { type: "success", text: "  🚀  OS KERNEL: LINUX REALTIME-FLOW16-GEN v6.12.8-REBEL" },
        { type: "success", text: "  ⚡  L1 CACHE: 32KB DATA / 32KB INSTRUCTION (LATENCY: 0.9ns)" },
        { type: "success", text: "  🧬  L2 CACHE: 512KB COHERENT CORE ALIGNMENT (LATENCY: 2.8ns)" },
        { type: "success", text: "  🌀  L3 CACHE: 16MB SYSTEM-WIDE SHARED (LATENCY: 11.2ns)" }
      ];
      triggerSuccessBeep();
    } else if (lowerCmd === "diagnostics") {
      response = [
        { type: "info", text: "Scanning space sectors & physical machine nodes..." },
        { type: "success", text: "[PASS] Node 0 (Cache L1 Alignment): Static padding optimal. No false sharing." },
        { type: "success", text: "[PASS] Node 1 (Virtual Paging): 4096B page size. TLB Hit Rate: 99.85%." },
        { type: "success", text: "[PASS] Node 2 (Threadpool Scheduler): Epoll reactor loop healthy. Threads active: 8." },
        { type: "success", text: "[PASS] Core Temperature: Ambient radiator flow operating at 34°C." },
        { type: "info", text: "Result: System integrity sitting at optimal 99.88%." }
      ];
      triggerSuccessBeep();
    } else if (lowerCmd.startsWith("alloc ")) {
      const parts = lowerCmd.split(" ");
      const num = parseInt(parts[1]);
      if (isNaN(num) || num <= 0 || num > 32) {
        response = [{ type: "error", text: "Error: Specify contiguous block count between 1 and 32 (e.g. 'alloc 4')." }];
      } else {
        let allocatedCount = 0;
        setMemoryBlocks(prev => {
          const next = [...prev];
          let firstFreeIdx = -1;
          
          if (allocAlgo === "first-fit") {
            // Find first chunk of free contiguous blocks
            for (let i = 0; i <= next.length - num; i++) {
              let possible = true;
              for (let j = 0; j < num; j++) {
                if (next[i + j] !== 0) { possible = false; break; }
              }
              if (possible) { firstFreeIdx = i; break; }
            }
          }

          if (firstFreeIdx !== -1) {
            for (let j = 0; j < num; j++) {
              next[firstFreeIdx + j] = 1;
            }
            allocatedCount = num;
          } else {
            // Fallback: allocate whatever is free
            for (let i = 0; i < next.length; i++) {
              if (next[i] === 0) {
                next[i] = 1;
                allocatedCount++;
                if (allocatedCount === num) break;
              }
            }
          }
          return next;
        });

        if (allocatedCount > 0) {
          response = [
            { type: "success", text: `[+] malloc(${num}) returned address pointer offset ${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}` },
            { type: "success", text: `[+] Flagged ${allocatedCount} block nodes in memory map.` },
            { type: "info", text: `[+] Review heap blocks visualizer in the [Memory Allocator] sub-tab.` }
          ];
          triggerSweep(true);
        } else {
          response = [{ type: "error", text: "Error: Out of memory! Heap space completely saturated. Please trigger a GC Sweep." }];
        }
      }
    } else if (lowerCmd.startsWith("explain ")) {
      const parts = lowerCmd.split(" ");
      const keyword = parts.slice(1).join(" ").trim().toLowerCase();

      const docLibrary = {
        mmap: "mmap() creates a direct mapping in the virtual address space of the process. It is used to load huge datasets or databases without overhead, enabling zero-copy physical operations.",
        attention: "Self-attention computes dynamic weights representing semantic dependency between sequence tokens. Modeled mathematically as: Softmax(QKᵀ / √d_k)V.",
        cache: "A hardware cache stores frequently retrieved resources. Dynamic spatial alignment prevents 'false sharing' across high-frequency thread boundaries.",
        mutex: "Mutex (Mutual Exclusion) enforces strict synchronization primitives on shared registers, ensuring parallel threads do not overwrite shared data, preventing catastrophic races.",
        paging: "Virtual Memory Paging divides memory into physical pages (typically 4KB) mapped dynamically via Translation Lookaside Buffers (TLB), preventing external fragmentation.",
        hnsw: "HNSW (Hierarchical Navigable Small World) maps high-dimensional vector spaces into multi-layered navigation graphs, achieving near-logarithmic approximate nearest neighbor lookups.",
        git: "Git logs commit histories as cryptographic Directed Acyclic Graphs (DAG). Commits represent immutable system snapshots tied to cryptographic parent hashes."
      };

      const matched = Object.keys(docLibrary).find(k => keyword.includes(k) || k.includes(keyword));
      if (matched) {
        response = [
          { type: "success", text: `[EXPLAIN: ${matched.toUpperCase()}]` },
          { type: "info", text: docLibrary[matched] }
        ];
        triggerSuccessBeep();
      } else {
        response = [
          { type: "error", text: `Error: Technical concept '${keyword}' not found in mainframe database.` },
          { type: "info", text: "Concepts logged: 'mmap', 'attention', 'cache', 'mutex', 'paging', 'hnsw', 'git'." }
        ];
      }
    } else if (lowerCmd === "git commit") {
      const hash = Math.random().toString(16).substring(2, 9).toUpperCase();
      response = [
        { type: "success", text: `[master node-${hash}] systems sync update commit` },
        { type: "success", text: " 3 files modified, 45 database lines inserted(+), 12 deleted(-)" },
        { type: "info", text: "DAG Node integrated. Propagating sublight sync across cognitive grid..." },
        { type: "success", text: "Cloud sync accomplished. All cluster nodes synchronized." }
      ];
      triggerSuccessBeep();
    } else {
      response = [
        { type: "error", text: `Command unrecognized: '${cmd}'` },
        { type: "info", text: "Type 'help' to review the physical diagnostics terminal reference." }
      ];
    }

    setTerminalHistory([...nextHistory, ...response]);
    setTerminalInput("");
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    executeCommand(terminalInput);
  };

  // Memory Allocator Utilities
  const allocateMemoryHeap = () => {
    let allocated = 0;
    setMemoryBlocks(prev => {
      const next = [...prev];
      let startIdx = -1;

      if (allocAlgo === "first-fit") {
        for (let i = 0; i <= next.length - allocSize; i++) {
          let chunkFree = true;
          for (let j = 0; j < allocSize; j++) {
            if (next[i + j] !== 0) { chunkFree = false; break; }
          }
          if (chunkFree) { startIdx = i; break; }
        }
      } else {
        // Best-fit simulator
        let bestStartIdx = -1;
        let bestChunkLen = Infinity;
        let currentStart = -1;
        let currentLen = 0;

        for (let i = 0; i < next.length; i++) {
          if (next[i] === 0) {
            if (currentStart === -1) currentStart = i;
            currentLen++;
          } else {
            if (currentStart !== -1) {
              if (currentLen >= allocSize && currentLen < bestChunkLen) {
                bestChunkLen = currentLen;
                bestStartIdx = currentStart;
              }
              currentStart = -1;
              currentLen = 0;
            }
          }
        }
        if (currentStart !== -1 && currentLen >= allocSize && currentLen < bestChunkLen) {
          bestStartIdx = currentStart;
        }
        startIdx = bestStartIdx;
      }

      if (startIdx !== -1) {
        for (let j = 0; j < allocSize; j++) {
          next[startIdx + j] = 1; // Allocated
        }
      } else {
        // Fallback: simple allocation
        for (let i = 0; i < next.length; i++) {
          if (next[i] === 0) {
            next[i] = 1;
            allocated++;
            if (allocated === allocSize) break;
          }
        }
      }
      return next;
    });
    triggerSuccessBeep();
  };

  const triggerGcSweep = () => {
    setGcSweeping(true);
    triggerSweep(true);
    setTimeout(() => {
      setMemoryBlocks(prev => prev.map(b => b === 2 ? 0 : b)); // Clean leaks
      setGcSweeping(false);
    }, 1200);
  };

  const forceMemoryLeak = () => {
    setMemoryBlocks(prev => {
      const next = [...prev];
      let leakedCount = 0;
      for (let i = 0; i < next.length; i++) {
        if (next[i] === 0) {
          next[i] = 2; // Leaked node (red)
          leakedCount++;
          if (leakedCount === 2) break;
        }
      }
      return next;
    });
    triggerSweep(false);
  };

  const triggerResetMemory = () => {
    setMemoryBlocks(Array(32).fill(0));
    triggerSweep(false);
  };

  // Self-Attention Matrix
  const attnTokens = ["CPU", "Kernel", "Malloc", "Cache", "Thread", "Mutex", "SQL", "LLM"];
  
  const getAttentionValue = (rowIdx, colIdx) => {
    const relationWeights = {
      "CPU_Cache": 0.94, "Cache_CPU": 0.94,
      "Thread_Mutex": 0.88, "Mutex_Thread": 0.88,
      "Kernel_Malloc": 0.85, "Malloc_Kernel": 0.85,
      "LLM_Cache": 0.32, "SQL_Mutex": 0.45,
      "Kernel_CPU": 0.78, "CPU_Kernel": 0.78,
      "Thread_Kernel": 0.72, "Kernel_Thread": 0.72,
      "Malloc_Cache": 0.68, "Cache_Malloc": 0.68
    };

    const tokenRow = attnTokens[rowIdx];
    const tokenCol = attnTokens[colIdx];

    if (rowIdx === colIdx) return 0.40;
    const directKey = `${tokenRow}_${tokenCol}`;
    const reverseKey = `${tokenCol}_${tokenRow}`;

    if (relationWeights[directKey] !== undefined) return relationWeights[directKey];
    if (relationWeights[reverseKey] !== undefined) return relationWeights[reverseKey];

    // Pseudo-random normalized score
    return parseFloat(((rowIdx * 3 + colIdx * 7) % 10 / 18 + 0.1).toFixed(2));
  };

  // Packet Dispatch Game
  const runPacketDispatch = () => {
    if (routingState !== "idle") return;

    const targetServer = Math.random() > 0.5 ? "A" : "B";
    setActiveServer(targetServer);

    setNetworkLogs([]);
    const logs = [];
    const pushLog = (txt) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${txt}`);
      setNetworkLogs([...logs]);
    };

    pushLog("Initiating high-frequency Client GET packet.");
    triggerSuccessBeep();
    setRoutingState("client_to_lb");

    setTimeout(() => {
      pushLog("🔀 Load Balancer routing request headers...");
      setRoutingState("lb_to_cdn");

      setTimeout(() => {
        if (cdnEnabled) {
          pushLog("⚡ CDN CACHE HIT! Delivering index.html cached assets instantly from edge node.");
          setRoutingState("cdn_to_client");

          setTimeout(() => {
            pushLog("✅ Connection resolved perfectly. RTT: 4ms.");
            setLatencyValue(4);
            setRoutingState("idle");
            triggerSuccessBeep();
          }, 500);
        } else {
          pushLog(`❄️ CDN Cache Bypass. Transporting packet to Core Server ${targetServer}...`);
          setRoutingState("lb_to_srv");

          setTimeout(() => {
            pushLog(`⚙️ Server ${targetServer} initialized database transaction pipeline.`);
            setRoutingState("srv_to_db");

            setTimeout(() => {
              pushLog(`🗄️ Database querying system. [Indexed status: ${dbIndexed ? "ACTIVE (Fast B-Tree)" : "INACTIVE (Slow Table Scan)"}]`);
              setRoutingState("db_processing");

              const queryDelay = dbIndexed ? 400 : 2000;
              setTimeout(() => {
                if (dbIndexed) {
                  pushLog("🎯 Index hit! Found matching record pointers immediately.");
                } else {
                  pushLog("⚠️ DB WARNING: Sequential scan forced! Thread blocked on sequential storage seek.");
                }
                pushLog("📦 Data mapped to packet frame. Routing back to Server core.");
                setRoutingState("db_to_srv");

                setTimeout(() => {
                  pushLog(`🖥️ Server ${targetServer} flushed headers and dispatched network frame.`);
                  setRoutingState("srv_to_client");

                  setTimeout(() => {
                    const finalLatency = dbIndexed ? 48 : 520;
                    pushLog(`✅ Request fully synchronized. Latency: ${finalLatency}ms.`);
                    setLatencyValue(finalLatency);
                    setRoutingState("idle");
                    if (!dbIndexed) {
                      triggerSweep(false);
                    } else {
                      triggerSuccessBeep();
                    }
                  }, 500);
                }, 500);
              }, queryDelay);
            }, 500);
          }, 500);
        }
      }, 500);
    }, 500);
  };

  return (
    <div className="space-y-5 rm-fade">
      {/* Lab Heading Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16, 36, 66, 0.45), rgba(10, 22, 40, 0.25))",
        border: `1.5px solid rgba(34, 211, 238, 0.18)`,
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        boxShadow: "0 0 25px rgba(34, 211, 238, 0.08)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="animate-pulse" style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: colors.cyan, boxShadow: `0 0 8px ${colors.cyan}` }} />
            <span style={{ fontSize: "10px", color: colors.cyan, fontWeight: "800", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Systems Holodeck
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: T1, fontFamily: "'Playfair Display', serif", fontStyle: "italic", marginTop: "3px" }}>
            Vessel Mainframe & Diagnostics Lab
          </div>
          <div style={{ fontSize: "11px", color: T3, marginTop: "2px" }}>
            Interactive tactile sandboxes modeling hardware caches, memory layout, self-attention, and network packets.
          </div>
        </div>

        {/* Audio reminder badge */}
        <div style={{
          fontSize: "10px",
          background: "rgba(34, 211, 238, 0.05)",
          border: "1px solid rgba(34, 211, 238, 0.12)",
          padding: "5px 12px",
          borderRadius: "15px",
          color: colors.cyan,
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          {audioEnabled ? "🔊 HOLODECK SOUNDS SYNCED" : "🔇 SOUNDS MUTED"}
        </div>
      </div>

      {/* Sub-tab Selectors (Tactile Glassmorphic Rail) */}
      <div style={{
        display: "flex",
        background: "rgba(10, 22, 40, 0.35)",
        border: `1px solid ${BDR}`,
        borderRadius: "12px",
        padding: "4px"
      }}>
        {[
          { key: "terminal", label: "Terminal CLI", icon: Terminal, color: colors.cyan },
          { key: "memory", label: "Memory Heap Allocator", icon: Layers, color: colors.magenta },
          { key: "attention", label: "Self-Attention Map", icon: Brain, color: colors.purple },
          { key: "network", label: "Packet Node Router", icon: Network, color: colors.green }
        ].map(item => {
          const active = labTab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className="rm-btn"
              onClick={() => {
                setLabTab(item.key);
                triggerSuccessBeep();
              }}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: "9px",
                background: active ? "rgba(255, 255, 255, 0.06)" : "transparent",
                border: `1px solid ${active ? "rgba(255,255,255,0.08)" : "transparent"}`,
                color: active ? T1 : T3,
                fontSize: "11.5px",
                fontWeight: active ? "800" : "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={14} style={{ color: active ? item.color : T3, filter: active ? `drop-shadow(0 0 4px ${item.color})` : "none" }} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. Terminal CLI Tab */}
      {labTab === "terminal" && (
        <div style={{
          background: "rgba(3, 8, 18, 0.65)",
          border: `1.5px solid ${BDR2}`,
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 15px 40px rgba(0,0,0,0.7)"
        }} className="grid grid-cols-1 lg:grid-cols-[1fr_220px]">
          {/* Main Shell Window */}
          <div style={{ display: "flex", flexDirection: "column", height: "350px", padding: "18px" }}>
            {/* Window chrome topbar */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#FBBF24" }} />
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10F5A0" }} />
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: T3, tracking: "1px" }}>mainframe_shell_rt</span>
            </div>

            {/* Scrollable Command Outputs */}
            <div style={{ flex: 1, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "8px" }} className="no-scrollbar">
              {terminalHistory.map((item, index) => {
                if (item.type === "input") {
                  return (
                    <div key={index} style={{ color: colors.cyan }}>
                      <span style={{ opacity: 0.5 }}>vessel@mainframe:~$</span> {item.text}
                    </div>
                  );
                }
                let cl = T2;
                if (item.type === "sys") cl = T3;
                if (item.type === "success") cl = colors.green;
                if (item.type === "error") cl = "#F87171";
                if (item.type === "info") cl = T2;
                return (
                  <div key={index} style={{ color: cl, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {item.text}
                  </div>
                );
              })}
              <div ref={terminalBottomRef} />
            </div>

            {/* Form Input Line */}
            <form onSubmit={handleTerminalSubmit} style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", marginTop: "10px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: colors.cyan }}>vessel@mainframe:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="Type 'help' or click a right macro..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: T1
                }}
              />
              <button type="submit" style={{ background: "none", border: "none", color: colors.cyan, cursor: "pointer", fontSize: "12px" }}>↵</button>
            </form>
          </div>

          {/* Quick-trigger Macros Side Rail */}
          <div style={{
            background: "rgba(10, 22, 40, 0.25)",
            borderLeft: `1px solid rgba(255,255,255,0.04)`,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ fontSize: "9px", color: T3, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>Macro Terminals</div>
            {[
              { label: "⚙️ sysinfo", cmd: "sysinfo" },
              { label: "📈 diagnostics", cmd: "diagnostics" },
              { label: "📦 git commit", cmd: "git commit" },
              { label: "🧩 alloc 4", cmd: "alloc 4" },
              { label: "📑 explain mmap", cmd: "explain mmap" },
              { label: "🧠 explain attention", cmd: "explain attention" },
              { label: "🧹 Clear Terminal", cmd: "clear" }
            ].map(macro => (
              <button
                key={macro.cmd}
                onClick={() => executeCommand(macro.cmd)}
                className="rm-card text-left"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${BDR}`,
                  borderRadius: "6px",
                  fontSize: "10.5px",
                  color: T2,
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.target.style.borderColor = colors.cyan}
                onMouseLeave={e => e.target.style.borderColor = BDR}
              >
                {macro.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Memory Allocator Simulator Tab */}
      {labTab === "memory" && (
        <div style={{
          background: "rgba(10, 22, 40, 0.45)",
          border: `1px solid ${BDR}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Allocator Controls Panel */}
          <div className="space-y-4">
            <div style={{ fontSize: "14px", fontWeight: "800", color: T1, display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} className="text-[#FF2D78]" />
              Virtual Heap Memory Simulator
            </div>
            <p style={{ fontSize: "11.5px", color: T3, lineHeight: "1.6" }}>
              Simulates low-level <strong>malloc()</strong> allocations and heap memory fragmentation. Under standard conditions, allocating and failing to free resources produces critical memory leaks.
            </p>

            {/* Controls */}
            <div className="space-y-3 p-14 bg-white/2 rounded-lg border border-white/4">
              {/* Algorithm choice */}
              <div>
                <div style={{ fontSize: "9px", color: T3, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Allocation Strategy</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["first-fit", "best-fit"].map(algo => (
                    <button
                      key={algo}
                      onClick={() => { setAllocAlgo(algo); triggerSuccessBeep(); }}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "5px",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        background: allocAlgo === algo ? "rgba(255,2D,120,0.12)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${allocAlgo === algo ? "#FF2D78" : "rgba(255,255,255,0.06)"}`,
                        color: allocAlgo === algo ? "#FF2D78" : T3,
                        cursor: "pointer",
                        textTransform: "capitalize"
                      }}
                    >
                      {algo.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allocation size */}
              <div>
                <div style={{ fontSize: "9px", color: T3, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Allocation Size (Contiguous Blocks)</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1, 2, 4, 8].map(size => (
                    <button
                      key={size}
                      onClick={() => { setAllocSize(size); triggerSuccessBeep(); }}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "5px",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        background: allocSize === size ? "rgba(255,2D,120,0.12)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${allocSize === size ? "#FF2D78" : "rgba(255,255,255,0.06)"}`,
                        color: allocSize === size ? "#FF2D78" : T3,
                        cursor: "pointer"
                      }}
                    >
                      {size} Block{size > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingTop: "10px" }}>
                <button
                  onClick={allocateMemoryHeap}
                  className="rm-btn"
                  style={{
                    padding: "8px 12px",
                    background: "linear-gradient(135deg, #FF2D78, #7C3AED)",
                    border: "none",
                    borderRadius: "6px",
                    color: T1,
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  🚀 Malloc({allocSize})
                </button>
                <button
                  onClick={forceMemoryLeak}
                  className="rm-btn"
                  style={{
                    padding: "8px 12px",
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: "6px",
                    color: colors.gold,
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  ⚠️ Inject Memory Leak
                </button>
                <button
                  onClick={triggerGcSweep}
                  className="rm-btn"
                  disabled={gcSweeping}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(16,245,160,0.08)",
                    border: "1px solid rgba(16,245,160,0.3)",
                    borderRadius: "6px",
                    color: colors.green,
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  🧹 Mark-Sweep GC
                </button>
                <button
                  onClick={triggerResetMemory}
                  className="rm-btn"
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: `1px solid ${BDR}`,
                    borderRadius: "6px",
                    color: T3,
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  ↺ Reset Memory
                </button>
              </div>
            </div>

            {/* Heap Legend */}
            <div style={{ display: "flex", gap: "14px", fontSize: "10px", color: T3, justifyContent: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "9px", height: "9px", border: `1px solid ${colors.green}`, borderRadius: "2px" }} /> Free
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "9px", height: "9px", background: colors.magenta, borderRadius: "2px" }} /> Allocated
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="animate-pulse" style={{ width: "9px", height: "9px", background: colors.gold, borderRadius: "2px", boxShadow: `0 0 4px ${colors.gold}` }} /> Leaked
              </span>
            </div>
          </div>

          {/* Grid visualizer */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(3,8,18,0.25)", border: `1px solid ${BDR}`, borderRadius: "10px", padding: "18px", position: "relative" }}>
            
            {/* GC Scanning sweep-bar overlay */}
            {gcSweeping && (
              <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "6px",
                background: `linear-gradient(90deg, ${colors.green}, transparent)`,
                boxShadow: `0 0 16px ${colors.green}`,
                animation: "gcSweepAnimate 1.2s cubic-bezier(0.16, 1, 0.3, 1) both",
                pointerEvents: "none"
              }} />
            )}

            <div style={{ fontSize: "10px", color: T3, fontFamily: "monospace", marginBottom: "12px", letterSpacing: "1px" }}>
              VIRTUAL MEMORY LAYOUT (32 BLOCKS OF 32KB)
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: "8px",
              width: "100%",
              maxWidth: "320px"
            }}>
              {memoryBlocks.map((state, index) => {
                let borderCol = "rgba(255,255,255,0.06)";
                let bgCol = "transparent";
                let shadow = "none";
                let labelColor = T3;

                if (state === 0) {
                  borderCol = `1px solid ${colors.green}20`;
                  bgCol = "rgba(16,245,160,0.01)";
                } else if (state === 1) {
                  borderCol = `1px solid ${colors.magenta}`;
                  bgCol = colors.magenta + "CC";
                  shadow = `0 0 6px ${colors.magenta}50`;
                  labelColor = T1;
                } else if (state === 2) {
                  borderCol = `1px solid ${colors.gold}`;
                  bgCol = colors.gold + "CC";
                  shadow = `0 0 10px ${colors.gold}80`;
                  labelColor = "#000000";
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleBlockClick(index)}
                    className="rm-card"
                    title={`Block 0x${(index * 4).toString(16).toUpperCase().padStart(2, "0")}`}
                    style={{
                      aspectRatio: "1/1",
                      border: borderCol,
                      background: bgCol,
                      boxShadow: shadow,
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      fontFamily: "monospace",
                      fontWeight: "800",
                      color: labelColor,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {`0x${(index * 4).toString(16).toUpperCase().padStart(2, "0")}`}
                  </div>
                );
              })}
            </div>

            <div style={{ width: "100%", marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px", fontSize: "11px", color: T3, textAlign: "center" }}>
              Memory Saturated: <strong>{Math.round((memoryBlocks.filter(b => b > 0).length / 32) * 100)}%</strong> · Leaked blocks: <strong style={{ color: colors.gold }}>{memoryBlocks.filter(b => b === 2).length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Neural Net Attention Matrix Tab */}
      {labTab === "attention" && (
        <div style={{
          background: "rgba(10, 22, 40, 0.45)",
          border: `1px solid ${BDR}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Attention explanations */}
          <div className="lg:col-span-2 space-y-4">
            <div style={{ fontSize: "14px", fontWeight: "800", color: T1, display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={16} className="text-[#A78BFA]" />
              Self-Attention Matrix Visualizer
            </div>
            <p style={{ fontSize: "11.5px", color: T3, lineHeight: "1.6" }}>
              Transformers use Query-Key attention equations to dynamically calculate which words (concepts) are mathematically contextualized together.
            </p>

            <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.01)", border: `1.5px dashed ${colors.purple}30`, borderRadius: "10px", fontSize: "11.5px" }}>
              <div style={{ fontWeight: "700", color: colors.purple, fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                Mathematical Equation
              </div>
              <code style={{ fontFamily: "monospace", display: "block", background: "rgba(3,8,18,0.5)", padding: "6px", borderRadius: "4px", color: T1, fontSize: "10.5px" }}>
                Attention(Q, K, V) = Softmax(QKᵀ / √d_k)V
              </code>
            </div>

            {/* Informational box based on selections */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1.5px solid ${BDR}`, borderRadius: "10px", padding: "14px" }}>
              {hoveredRow !== null && hoveredCol !== null ? (
                <>
                  <div style={{ fontSize: "9px", color: colors.purple, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                    Attention Relationship Focus
                  </div>
                  <div style={{ fontSize: "12px", color: T1, fontWeight: "700" }}>
                    {attnTokens[hoveredRow]} ⇄ {attnTokens[hoveredCol]}
                  </div>
                  <p style={{ fontSize: "11px", color: T3, marginTop: "6px", lineHeight: "1.5" }}>
                    The neural attention equation yields a connection index of <strong>{getAttentionValue(hoveredRow, hoveredCol)}</strong>. 
                    {getAttentionValue(hoveredRow, hoveredCol) > 0.8 ? (
                      " This represents a highly coherent connection! Low-level thread structures are tightly correlated with synchronization systems."
                    ) : getAttentionValue(hoveredRow, hoveredCol) > 0.6 ? (
                      " Represents standard operational semantic correlation."
                    ) : (
                      " Low attention binding: these domains operate within distinct compiler pipelines."
                    )}
                  </p>
                </>
              ) : (
                <div style={{ textAlign: "center", color: T3, padding: "15px 0", fontSize: "11.5px" }}>
                  Hover over matrix cells to capture structural attention coefficients.
                </div>
              )}
            </div>
          </div>

          {/* Matrix visualization */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center">
            {/* Axis headers */}
            <div style={{ display: "grid", gridTemplateColumns: "55px repeat(8, 1fr)", width: "100%", maxWidth: "340px", gap: "3px", marginBottom: "3px" }}>
              <div />
              {attnTokens.map((t, idx) => (
                <div
                  key={t}
                  style={{
                    fontSize: "8.5px",
                    fontFamily: "monospace",
                    fontWeight: "800",
                    color: hoveredCol === idx ? colors.purple : T3,
                    textAlign: "center"
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            <div style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "3px" }}>
              {attnTokens.map((rowToken, rIdx) => (
                <div key={rowToken} style={{ display: "grid", gridTemplateColumns: "55px repeat(8, 1fr)", gap: "3px", alignItems: "center" }}>
                  
                  {/* Left row header */}
                  <div
                    style={{
                      fontSize: "9px",
                      fontFamily: "monospace",
                      fontWeight: "800",
                      color: hoveredRow === rIdx ? colors.purple : T3,
                      textAlign: "right",
                      paddingRight: "6px"
                    }}
                  >
                    {rowToken}
                  </div>

                  {/* Matrix cells */}
                  {attnTokens.map((colToken, cIdx) => {
                    const weight = getAttentionValue(rIdx, cIdx);
                    const isSelected = hoveredRow === rIdx && hoveredCol === cIdx;
                    
                    // Style base weight opacity
                    let cellBg = `rgba(167, 139, 250, ${weight * 0.9})`;
                    let borderStyle = isSelected ? `1px solid ${T1}` : "1px solid transparent";

                    return (
                      <div
                        key={colToken}
                        onMouseEnter={() => {
                          setHoveredRow(rIdx);
                          setHoveredCol(cIdx);
                        }}
                        onMouseLeave={() => {
                          setHoveredRow(null);
                          setHoveredCol(null);
                        }}
                        style={{
                          aspectRatio: "1/1",
                          background: cellBg,
                          border: borderStyle,
                          borderRadius: "3px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "8px",
                          fontFamily: "monospace",
                          fontWeight: "800",
                          color: weight > 0.6 ? "#000000" : T1,
                          cursor: "crosshair",
                          boxShadow: isSelected ? `0 0 8px ${colors.purple}` : "none",
                          transition: "all 0.1s ease"
                        }}
                      >
                        {weight.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. Network Node Packet Router Game Tab */}
      {labTab === "network" && (
        <div style={{
          background: "rgba(10, 22, 40, 0.45)",
          border: `1px solid ${BDR}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
        }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Configuration Parameters Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div style={{ fontSize: "14px", fontWeight: "800", color: T1, display: "flex", alignItems: "center", gap: "8px" }}>
              <Network size={16} className="text-[#10F5A0]" />
              Packet Routing Dispatcher
            </div>
            <p style={{ fontSize: "11.5px", color: T3, lineHeight: "1.6" }}>
              Visualizes client-to-database requests. Enable cached layers (CDN) or database indexes to observe sublight routing latency.
            </p>

            <div className="p-14 bg-white/2 rounded-lg border border-white/4 space-y-4">
              
              {/* Parameter 1: CDN */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11.5px", fontWeight: "700", color: T1 }}>Enable Edge CDN Cache</div>
                  <div style={{ fontSize: "9.5px", color: T3, marginTop: "1.5px" }}>Resolves requests at edge before hit origin servers.</div>
                </div>
                <button
                  onClick={() => { setCdnEnabled(!cdnEnabled); triggerSuccessBeep(); }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: cdnEnabled ? "rgba(16,245,160,0.12)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${cdnEnabled ? colors.green : "rgba(255,255,255,0.06)"}`,
                    color: cdnEnabled ? colors.green : T3,
                    fontSize: "10px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  {cdnEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Parameter 2: DB indexing */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11.5px", fontWeight: "700", color: T1 }}>Database B-Tree Indexing</div>
                  <div style={{ fontSize: "9.5px", color: T3, marginTop: "1.5px" }}>Accelerates query compiler execution index pointer searches.</div>
                </div>
                <button
                  onClick={() => { setDbIndexed(!dbIndexed); triggerSuccessBeep(); }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    background: dbIndexed ? "rgba(16,245,160,0.12)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${dbIndexed ? colors.green : "rgba(255,255,255,0.06)"}`,
                    color: dbIndexed ? colors.green : T3,
                    fontSize: "10px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  {dbIndexed ? "ACTIVE" : "SEQ SCAN"}
                </button>
              </div>

              {/* Fire request action */}
              <button
                onClick={runPacketDispatch}
                disabled={routingState !== "idle"}
                className="rm-btn"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: routingState !== "idle" ? "rgba(255,255,255,0.02)" : "linear-gradient(135deg, #10F5A0, #0EA5E9)",
                  border: "none",
                  borderRadius: "8px",
                  color: routingState !== "idle" ? T3 : "#000000",
                  fontSize: "11.5px",
                  fontWeight: "900",
                  cursor: routingState !== "idle" ? "not-allowed" : "pointer"
                }}
              >
                {routingState !== "idle" ? "✈️ Dispatched Packet..." : "⚡ DISPATCH NETWORK PACKET"}
              </button>
            </div>

            {/* Performance log list */}
            <div style={{
              background: "rgba(3,8,18,0.45)",
              border: `1px solid ${BDR}`,
              borderRadius: "8px",
              padding: "10px",
              height: "100px",
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "10px",
              color: T2
            }} className="no-scrollbar">
              {networkLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* SVG Map visualizer */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center" style={{ background: "rgba(3,8,18,0.25)", border: `1px solid ${BDR}`, borderRadius: "10px", padding: "14px", position: "relative" }}>
            <div style={{ fontSize: "10px", color: T3, fontFamily: "monospace", marginBottom: "14px", letterSpacing: "1px" }}>
              ACTIVE GRAPH ROUTING INTERCONNECT
            </div>

            {/* Simulated Live SVG Node Interconnect Map */}
            <svg viewBox="0 0 420 220" style={{ width: "100%", maxWidth: "380px" }}>
              {/* Paths */}
              <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none">
                {/* Client to LB */}
                <line x1="40" y1="110" x2="130" y2="110" stroke={routingState === "client_to_lb" || routingState === "srv_to_client" || routingState === "cdn_to_client" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
                {/* LB to CDN */}
                <line x1="130" y1="110" x2="210" y2="50" stroke={routingState === "lb_to_cdn" || routingState === "cdn_to_client" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
                {/* LB to Server A */}
                <line x1="130" y1="110" x2="240" y2="90" stroke={routingState === "lb_to_srv" || routingState === "db_to_srv" || routingState === "srv_to_client" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
                {/* LB to Server B */}
                <line x1="130" y1="110" x2="240" y2="130" stroke={routingState === "lb_to_srv" || routingState === "db_to_srv" || routingState === "srv_to_client" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
                {/* Server A to DB */}
                <line x1="240" y1="90" x2="350" y2="110" stroke={routingState === "srv_to_db" || routingState === "db_processing" || routingState === "db_to_srv" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
                {/* Server B to DB */}
                <line x1="240" y1="130" x2="350" y2="110" stroke={routingState === "srv_to_db" || routingState === "db_processing" || routingState === "db_to_srv" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth={routingState !== "idle" ? "2" : "1.5"} />
              </g>

              {/* Animated Request Packet Dot */}
              {routingState === "client_to_lb" && (
                <circle cx="85" cy="110" r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "lb_to_cdn" && (
                <circle cx="170" cy="80" r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "cdn_to_client" && (
                <circle cx="125" cy="80" r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "lb_to_srv" && (
                <circle cx="185" cy={activeServer === "A" ? 100 : 120} r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "srv_to_db" && (
                <circle cx="295" cy={activeServer === "A" ? 100 : 120} r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "db_processing" && (
                <circle cx="350" cy="110" r="5" fill={colors.magenta} className={!dbIndexed ? "animate-ping" : ""} filter={`drop-shadow(0 0 6px ${colors.magenta})`} />
              )}
              {routingState === "db_to_srv" && (
                <circle cx="295" cy={activeServer === "A" ? 100 : 120} r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}
              {routingState === "srv_to_client" && (
                <circle cx="120" cy="110" r="5" fill={colors.green} filter={`drop-shadow(0 0 6px ${colors.green})`} />
              )}

              {/* Node Icons */}
              {/* Client Node */}
              <g transform="translate(20,95)">
                <rect width="30" height="30" rx="6" fill="#0F172A" stroke={colors.cyan} strokeWidth="1.5" />
                <text x="15" y="18" fill={colors.cyan} fontSize="9" textAnchor="middle" fontWeight="bold">PC</text>
                <text x="15" y="42" fill={T3} fontSize="8" textAnchor="middle">Client</text>
              </g>

              {/* Load Balancer */}
              <g transform="translate(115,95)">
                <rect width="30" height="30" rx="6" fill="#0F172A" stroke={colors.purple} strokeWidth="1.5" />
                <text x="15" y="18" fill={colors.purple} fontSize="9" textAnchor="middle" fontWeight="bold">LB</text>
                <text x="15" y="42" fill={T3} fontSize="8" textAnchor="middle">Balancer</text>
              </g>

              {/* CDN Cache Node */}
              <g transform="translate(195,35)">
                <rect width="30" height="30" rx="6" fill="#0F172A" stroke={cdnEnabled ? colors.cyan : "rgba(255,255,255,0.06)"} strokeWidth="1.5" opacity={cdnEnabled ? 1 : 0.4} />
                <text x="15" y="18" fill={cdnEnabled ? colors.cyan : T3} fontSize="9" textAnchor="middle" fontWeight="bold" opacity={cdnEnabled ? 1 : 0.4}>CDN</text>
                <text x="15" y="42" fill={T3} fontSize="8" textAnchor="middle">Edge Cache</text>
              </g>

              {/* Server A */}
              <g transform="translate(225,75)">
                <rect width="30" height="30" rx="6" fill="#0F172A" stroke={activeServer === "A" && routingState !== "idle" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth="1.5" />
                <text x="15" y="18" fill={T2} fontSize="9" textAnchor="middle" fontWeight="bold">SRV A</text>
              </g>

              {/* Server B */}
              <g transform="translate(225,115)">
                <rect width="30" height="30" rx="6" fill="#0F172A" stroke={activeServer === "B" && routingState !== "idle" ? colors.green : "rgba(255,255,255,0.06)"} strokeWidth="1.5" />
                <text x="15" y="18" fill={T2} fontSize="9" textAnchor="middle" fontWeight="bold">SRV B</text>
              </g>

              {/* DB SQL Database */}
              <g transform="translate(335,95)">
                <rect width="35" height="30" rx="6" fill="#0F172A" stroke={dbIndexed ? colors.green : colors.magenta} strokeWidth="1.5" />
                <text x="17.5" y="18" fill={dbIndexed ? colors.green : colors.magenta} fontSize="9" textAnchor="middle" fontWeight="bold">SQL</text>
                <text x="17.5" y="42" fill={T3} fontSize="8" textAnchor="middle">PostgreSQL</text>
              </g>
            </svg>

            {/* Real-time latency score */}
            {latencyValue !== null && (
              <div style={{
                marginTop: "12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "11px",
                color: latencyValue < 10 ? colors.green : (latencyValue < 100 ? colors.cyan : colors.magenta),
                fontWeight: "800",
                letterSpacing: "0.5px"
              }}>
                ⏱️ LAST TRANSACTION LATENCY: {latencyValue}ms
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
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
  const [focusedMonth, setFocusedMonth] = useState(null);
  const [syncState, setSyncState] = useState("saved"); // "saving" | "saved"

  // Elite 1% Mastery States
  const [eliteDone, setEliteDone] = useState(() => ls.get("rmx_elite_done", {}));
  const [eliteExpandedDifferentiator, setEliteExpandedDifferentiator] = useState(null);
  const [eliteActiveCategory, setEliteActiveCategory] = useState("all");
  const [eliteSundayAnswers, setEliteSundayAnswers] = useState(() => ls.get("rmx_sunday_answers", {
    q1: "", q2: "", q3: "", q4: "", q5: "", q6: ""
  }));
  const [weeklyHabits, setWeeklyHabits] = useState(() => ls.get("rmx_weekly_habits", {}));

  const isFirstRender = useRef(true);



  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [sandboxName, setSandboxName] = useState("");

  // Custom Flow Portal & AI Copilot State
  const [portalOpen, setPortalOpen] = useState(false);
  const [starSpeed, setStarSpeed] = useState(() => parseFloat(localStorage.getItem("rmx_star_speed") || "1"));
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem("rmx_audio_enabled");
    return saved === null ? true : saved === "true";
  });
  const [aiMessages, setAiMessages] = useState(() => {
    const saved = localStorage.getItem("rmx_ai_messages");
    return saved ? JSON.parse(saved) : [
      {
        role: "model",
        parts: [{ text: "Greetings, Commander. I am your Flow 16 Systems Copilot. My High-Thinking Reasoning Engine is fully active and synchronized. How can I assist you with low-level systems engineering, database optimization, or mathematical AI foundations today?" }]
      }
    ];
  });
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [highThinkingEnabled, setHighThinkingEnabled] = useState(true);

  // Systems Academy & Interactive Lesson Notes State
  const [activePortalTab, setActivePortalTab] = useState("chat"); // "chat" | "academy"
  const [customAcademyTopic, setCustomAcademyTopic] = useState("");
  const [lessonData, setLessonData] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [editableNotes, setEditableNotes] = useState("");
  const [notesSavedStatus, setNotesSavedStatus] = useState("");
  const [vesselSettingsOpen, setVesselSettingsOpen] = useState(false);

  const handleGenerateLesson = async (selectedPresetTopic) => {
    const finalTopic = selectedPresetTopic || customAcademyTopic;
    if (!finalTopic || !finalTopic.trim() || lessonLoading) return;

    setLessonLoading(true);
    setLessonData(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setNotesSavedStatus("");

    try {
      const res = await fetch("/api/gemini/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic })
      });

      if (!res.ok) throw new Error("Failed to compile interactive lesson.");

      const data = await res.json();
      setLessonData(data);
      setEditableNotes(data.structuredNotes || "");
      playSuccessBeep(audioEnabled);
    } catch (err) {
      console.error(err);
      alert("Error generating lesson: " + (err instanceof Error ? err.message : "Connection failure"));
    } finally {
      setLessonLoading(false);
    }
  };

  const handleSaveLessonNotes = () => {
    if (!lessonData) return;
    setNotesSavedStatus("saving");
    const noteKey = lessonData.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    localStorage.setItem(`rmx_cs_${noteKey}`, editableNotes);

    // Call sync function directly
    syncToFirestore(user?.uid);

    setTimeout(() => {
      setNotesSavedStatus("saved");
      playSuccessBeep(audioEnabled);
    }, 600);
  };

  const handleSendAiMessage = async (textToSend) => {
    const userText = textToSend || aiInput;
    if (!userText.trim() || aiLoading) return;

    if (!textToSend) setAiInput("");

    const newUserMessage = { role: "user", parts: [{ text: userText }] };
    const updatedMessages = [...aiMessages, newUserMessage];
    setAiMessages(updatedMessages);
    localStorage.setItem("rmx_ai_messages", JSON.stringify(updatedMessages));
    setAiLoading(true);

    try {
      const history = aiMessages.map(m => ({
        role: m.role,
        parts: m.parts.map(p => ({ text: p.text }))
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history,
          highThinkingEnabled,
        })
      });

      if (!res.ok) {
        let errMsg = "Reasoning Engine returned an error. Verify your connection.";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      const modelMessage = { 
        role: "model", 
        parts: [{ text: data.text }],
        groundingChunks: data.groundingChunks,
        searchQueries: data.searchQueries
      };
      const nextMessages = [...updatedMessages, modelMessage];
      setAiMessages(nextMessages);
      localStorage.setItem("rmx_ai_messages", JSON.stringify(nextMessages));
      playSuccessBeep(audioEnabled);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        role: "model",
        parts: [{ text: `🚨 CONNECTION INTERRUPTED: ${err instanceof Error ? err.message : "The reasoning thrum was disrupted. Please try again."}` }]
      };
      setAiMessages([...updatedMessages, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearChat = () => {
    const defaultMsg = [
      {
        role: "model",
        parts: [{ text: "Greetings, Commander. I am your Flow 16 Systems Copilot. My High-Thinking Reasoning Engine is fully active and synchronized. How can I assist you with low-level systems engineering, database optimization, or mathematical AI foundations today?" }]
      }
    ];
    setAiMessages(defaultMsg);
    localStorage.removeItem("rmx_ai_messages");
    playSweepSound(audioEnabled, false);
  };

  const syncToFirestore = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const doneData = ls.get("rmx_done", {});
      const bkmData = ls.get("rmx_bkm", {});
      const wfocusData = ls.get("rmx_wfocus", "");
      const eliteDoneData = ls.get("rmx_elite_done", {});
      const sundayAnswersData = ls.get("rmx_sunday_answers", { q1: "", q2: "", q3: "", q4: "", q5: "", q6: "" });
      const weeklyHabitsData = ls.get("rmx_weekly_habits", {});

      const cheatSheets = {};
      const resources = {};
      const moduleNotes = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (key.startsWith("rmx_cs_")) {
            cheatSheets[key.replace("rmx_cs_", "")] = ls.get(key, "");
          } else if (key.startsWith("rmx_res_")) {
            resources[key.replace("rmx_res_", "")] = ls.get(key, []);
          } else if (key.startsWith("rmx_module_notes_")) {
            moduleNotes[key.replace("rmx_module_notes_", "")] = ls.get(key, "");
          }
        }
      }

      const userProgressRef = doc(db, "user_progress", uid);
      try {
        await setDoc(userProgressRef, {
          uid,
          done: doneData,
          bkm: bkmData,
          wfocus: wfocusData,
          eliteDone: eliteDoneData,
          sundayAnswers: sundayAnswersData,
          weeklyHabits: weeklyHabitsData,
          cheatSheets,
          resources,
          moduleNotes,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `user_progress/${uid}`);
      }
    } catch (err) {
      console.error("Error syncing to Firestore:", err);
    }
  }, []);

  const triggerSaveSync = useCallback(() => {
    setSyncState("saving");
    const t = setTimeout(() => {
      setSyncState("saved");
      if (user) {
        syncToFirestore(user.uid);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [syncToFirestore, user]);

  // Make triggerCloudSync globally available
  useEffect(() => {
    window.triggerCloudSync = () => {
      setSyncState("saving");
      setTimeout(() => {
        setSyncState("saved");
        if (user) {
          syncToFirestore(user.uid);
        }
      }, 700);
    };
    return () => {
      delete window.triggerCloudSync;
    };
  }, [syncToFirestore, user]);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
      playSuccessBeep(audioEnabled);
    } catch (err) {
      console.error("Google login failed:", err);
      let errMsg = "Google authentication failed. Please open in a new tab or use Sandbox mode.";
      if (err.code === "auth/popup-blocked") {
        errMsg = "Popup was blocked by your browser. Please allow popups or open the app in a new tab.";
      } else if (err.code === "auth/iframe-userAgent-blocked" || err.message?.includes("iframe")) {
        errMsg = "Google login is blocked inside the embedded iframe. Use Sandbox Mode below to connect instantly!";
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    }
  };

  const loadUserProgress = useCallback(async (uid) => {
    if (!uid) return;
    setSyncState("saving");
    try {
      const progressRef = doc(db, "user_progress", uid);
      let snap;
      try {
        snap = await getDoc(progressRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `user_progress/${uid}`);
      }
      if (snap.exists()) {
        const data = snap.data();
        if (data.done) { setDone(data.done); ls.set("rmx_done", data.done); }
        if (data.bkm) { setBkm(data.bkm); ls.set("rmx_bkm", data.bkm); }
        if (data.wfocus !== undefined) { setWeekFocus(data.wfocus); ls.set("rmx_wfocus", data.wfocus); }
        if (data.eliteDone) { setEliteDone(data.eliteDone); ls.set("rmx_elite_done", data.eliteDone); }
        if (data.sundayAnswers) { setEliteSundayAnswers(data.sundayAnswers); ls.set("rmx_sunday_answers", data.sundayAnswers); }
        if (data.weeklyHabits) { setWeeklyHabits(data.weeklyHabits); ls.set("rmx_weekly_habits", data.weeklyHabits); }

        if (data.cheatSheets) {
          Object.entries(data.cheatSheets).forEach(([k, v]) => {
            ls.set(`rmx_cs_${k}`, v);
          });
        }
        if (data.resources) {
          Object.entries(data.resources).forEach(([k, v]) => {
            ls.set(`rmx_res_${k}`, v);
          });
        }
        if (data.moduleNotes) {
          Object.entries(data.moduleNotes).forEach(([k, v]) => {
            ls.set(`rmx_module_notes_${k}`, v);
          });
        }
      } else {
        await syncToFirestore(uid);
      }
      setSyncState("saved");
    } catch (err) {
      console.error("Error loading user progress:", err);
      setSyncState("saved");
    }
  }, [setDone, setBkm, setWeekFocus, setEliteDone, setEliteSundayAnswers, setWeeklyHabits, syncToFirestore]);

  const handleSandboxLogin = async (e) => {
    if (e) e.preventDefault();
    if (!sandboxName.trim()) return;
    const simUser = {
      uid: "sandbox_dev_" + Math.random().toString(36).substring(2, 9),
      displayName: sandboxName.trim(),
      email: "sandbox_developer@flow16.local",
      photoURL: null,
      isSandbox: true
    };
    ls.set("rmx_sandbox_user", simUser);
    setUser(simUser);
    setAuthError("");
    setSandboxName("");
    playSuccessBeep(audioEnabled);
    await loadUserProgress(simUser.uid);
  };

  const handleDisconnect = async () => {
    setAuthError("");
    if (user?.isSandbox) {
      ls.remove("rmx_sandbox_user");
      setUser(null);
      playSweepSound(audioEnabled, false);
      return;
    }
    try {
      await signOut(auth);
      playSweepSound(audioEnabled, false);
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
  };

  // Auth observer
  useEffect(() => {
    // Check if there is already a sandbox user logged in
    const sandboxUser = ls.get("rmx_sandbox_user", null);
    if (sandboxUser) {
      setUser(sandboxUser);
      setAuthLoading(false);
      loadUserProgress(sandboxUser.uid);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Avoid overriding active sandbox session with null firebase user
      const currentSandboxUser = ls.get("rmx_sandbox_user", null);
      if (currentSandboxUser) {
        setUser(currentSandboxUser);
        setAuthLoading(false);
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        await loadUserProgress(currentUser.uid);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [loadUserProgress]);

  // Prevent background scrolling when Flow Portal drawer is open
  useEffect(() => {
    if (portalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [portalOpen]);

  // Autosync on local state updates when user is logged in
  useEffect(() => {
    ls.set("rmx_wfocus", weekFocus);
    if (isFirstRender.current) return;
    
    setSyncState("saving");
    const t = setTimeout(() => {
      if (user) {
        syncToFirestore(user.uid).then(() => {
          setSyncState("saved");
        });
      } else {
        setSyncState("saved");
      }
    }, 1500);
    
    return () => clearTimeout(t);
  }, [done, bkm, weekFocus, eliteDone, eliteSundayAnswers, weeklyHabits, user, syncToFirestore]);

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
      if (!prev[key]) playSuccessBeep(audioEnabled);
      const m=MONTHS.find(x=>x.month===mn);
      if(m&&!prev[key]){const nc=Object.keys(next).filter(k=>k.startsWith(`m${mn}_`)&&next[k]).length;if(nc===totalItems(m))setConfetti(mn);}
      return next;
    });
  },[audioEnabled]);
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
      if (!isComp) playSuccessBeep(audioEnabled);
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
  }, [audioEnabled]);
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

      {/* Cosmic space & universe visual elements */}
      <UniverseBackground speed={starSpeed} />

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

          {/* Embedded Pomodoro focus card */}
          <Pomodoro />

          {/* Real-time Systems AI Copilot Chatbot */}
          <SidebarChatbot 
            aiMessages={aiMessages}
            aiLoading={aiLoading}
            handleSendAiMessage={handleSendAiMessage}
            highThinkingEnabled={highThinkingEnabled}
            setHighThinkingEnabled={setHighThinkingEnabled}
            audioEnabled={audioEnabled}
          />

          {/* Systems Academy Card */}
          <SidebarAcademy
            customAcademyTopic={customAcademyTopic}
            setCustomAcademyTopic={setCustomAcademyTopic}
            lessonData={lessonData}
            setLessonData={setLessonData}
            lessonLoading={lessonLoading}
            handleGenerateLesson={handleGenerateLesson}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            quizSubmitted={quizSubmitted}
            setQuizSubmitted={setQuizSubmitted}
            editableNotes={editableNotes}
            setEditableNotes={setEditableNotes}
            notesSavedStatus={notesSavedStatus}
            handleSaveLessonNotes={handleSaveLessonNotes}
            audioEnabled={audioEnabled}
          />
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
                {[
                  { key: "roadmap", label: "Roadmap", icon: "rebel", color: "#FF2D78" },
                  { key: "library", label: "Library", icon: "jedi", color: "#A78BFA" },
                  { key: "tracks", label: "Tracks", icon: "mando", color: "#38bdf8" },
                  { key: "elite", label: "Elite 1%", icon: "jedi", color: "#FBBF24" },
                  { key: "systems", label: "Systems Lab", icon: "mando", color: "#22D3EE" },
                  { key: "progress", label: "Progress", icon: "empire", color: "#10F5A0" }
                ].map(item => (
                  <button
                    key={item.key}
                    className="rm-tab"
                    onClick={() => setTab(item.key)}
                    style={ts(item.key)}
                    data-saber-color={item.color}
                  >
                    <FactionIcon name={item.icon} size={13} color={tab === item.key ? item.color : T2} style={{ marginRight: "6px", transition: "all 0.2s" }} />
                    {item.label}
                  </button>
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
                          {d === "All" ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <FactionIcon name="rebel" size={11} color={active ? T1 : "#FF2D78"} />
                              All Levels
                            </span>
                          ) : d} <span style={{fontSize:"8.5px", opacity: active ? 0.9 : 0.6, marginLeft:"3px"}}>({count})</span>
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
                          {dom === "All" ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <FactionIcon name="jedi" size={11} color={active ? T1 : "#22D3EE"} />
                              All Domains
                            </span>
                          ) : dom} <span style={{fontSize:"8.5px", opacity: active ? 0.9 : 0.6, marginLeft:"3px"}}>({count})</span>
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

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                  gap: "16px",
                  justifyContent: "center",
                  alignItems: "start",
                  marginBottom: "20px"
                }}>
                  {MONTHS.filter(m=>m.phase===phase.id).map((month,idx)=>{
                    const isMatch = matchesSearch(month, searchQuery);
                    if (!isMatch) return null;

                    const hasMatchingTopics = month.topics.some(topic => {
                      const matchesDiff = selectedDiff === "All" || topic.diff === selectedDiff;
                      const matchesDom = selectedDomain === "All" || getTopicDomain(topic, month) === selectedDomain;
                      return matchesDiff && matchesDom;
                    });
                    if (!hasMatchingTopics) return null;

                    const isSelected = exp === month.month;
                    const p = pct(month, done);
                    const ph = PHASES[month.phase - 1];
                    const isBkm = bkm[month.month];
                    return(
                      <div key={month.month} style={{
                        animation: `fadeUp .28s ease ${idx*.05}s both`,
                        display: "flex",
                        flexDirection: "column"
                      }}>
                        <div className="rm-card" data-saber-color={ph.c} style={{
                          background: isSelected ? CARD2 : CARD,
                          border: `1px solid ${isSelected ? ph.c : BDR}`,
                          borderRadius: "11px",
                          padding: "16px 18px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: isSelected ? `0 0 20px ${ph.glow}` : "none",
                          transition: "all .22s ease"
                        }} onClick={()=>setExp(month.month)}>
                          <div style={{position:"absolute",right:"10px",top:"-12px",fontSize:"72px",fontWeight:"900",color:`${ph.c}04`,lineHeight:1,pointerEvents:"none",userSelect:"none"}}>{String(month.month).padStart(2,"0")}</div>
                          <div style={{position:"absolute",left:0,top:0,bottom:0,width:"4px",background:`linear-gradient(180deg,${ph.c},${ph.c2})`,borderRadius:"11px 0 0 11px",boxShadow:isSelected?`2px 0 10px ${ph.c}60`:"none",transition:"box-shadow .25s"}}/>
                          <div style={{width:"36px",height:"36px",borderRadius:"8px",background:`${ph.c}14`,border:`1px solid ${ph.c}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:ph.c,flexShrink:0,marginLeft:"4px",zIndex:1}}>{String(month.month).padStart(2,"0")}</div>
                          <div style={{flex:1,minWidth:0,zIndex:1}}>
                             <div style={{fontSize:"13px",fontWeight:"700",color:T1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                              {highlightText(month.title, searchQuery, ph.c)}
                              {isBkm&&<span style={{marginLeft:"6px",fontSize:"12px"}}>⭐</span>}
                              {p===100&&<span style={{marginLeft:"6px",fontSize:"9px",background:"rgba(16,245,160,0.1)",color:"#10F5A0",padding:"1px 6px",borderRadius:"3px",border:"1px solid rgba(16,245,160,0.22)",fontWeight:"700"}}>✓ DONE</span>}
                            </div>
                            <div style={{fontSize:"10px",color:T3,marginTop:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{highlightText(month.tag, searchQuery, ph.c)}</div>
                            <div style={{height:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"1.5px",marginTop:"8px",overflow:"hidden",width:"120px"}}>
                              <div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${ph.c},${ph.c2})`,transition:"width .8s ease"}}/>
                            </div>
                          </div>
                          <div style={{position:"relative",zIndex:1,flexShrink:0}}>
                            <Ring p={p} color={ph.c} size={44} stroke={4}/>
                            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:p>0?ph.c:T3}}>{p}%</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:"4px",zIndex:1}} onClick={e=>e.stopPropagation()}>
                            <button className="rm-btn" onClick={()=>toggleBkm(month.month)} style={{padding:"4px 6px",borderRadius:"4px",background:"transparent",border:"none",color:isBkm?"#FBBF24":T3,fontSize:"14px",cursor:"pointer"}}>{isBkm?"★":"☆"}</button>
                            <span style={{color:T3,fontSize:"11px",padding:"4px",opacity:0.7}}>↗</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

                        {i === 0 && (
                          <div style={{ marginTop: "16px", background: "rgba(34, 211, 238, 0.03)", border: "1px solid rgba(34, 211, 238, 0.15)", borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#22D3EE", fontWeight: "800", marginBottom: "10px", textTransform: "uppercase" }}>🎯 Algorithmic Pattern Recognition Key</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.3fr", gap: "8px 12px", fontSize: "11px", color: T2 }}>
                              <div style={{ fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px", color: T3 }}>IF PROBLEM SIGNAL SAYS...</div>
                              <div style={{ fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "4px", color: T3 }}>FIRST PATTERN TO CONSIDER</div>
                              
                              <div>• Pair sum, complements</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Hash Map / Two Pointers</div>
                              <div>• Longest substring/subarray</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Sliding Window</div>
                              <div>• Sorted array</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Binary Search / Two Pointers</div>
                              <div>• Tree path, depth</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>DFS</div>
                              <div>• Shortest path</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>BFS / Dijkstra</div>
                              <div>• Top K elements</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Heap / Priority Queue</div>
                              <div>• Dependencies/ordering</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Topological Sort</div>
                              <div>• Connected components</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>DFS / Union-Find</div>
                              <div>• All possible combinations</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Backtracking</div>
                              <div>• Maximize/minimize with overlaps</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Dynamic Programming</div>
                              <div>• Interval merging/scheduling</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Greedy + Sorting</div>
                              <div>• Frequent range queries/updates</div><div style={{ color: "#22D3EE", fontWeight: "600" }}>Segment Tree / Fenwick Tree</div>
                            </div>
                          </div>
                        )}

                        {i === 1 && (
                          <div style={{ marginTop: "16px", background: "rgba(167, 139, 250, 0.03)", border: "1px solid rgba(167, 139, 250, 0.15)", borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#A78BFA", fontWeight: "800", marginBottom: "8px", textTransform: "uppercase" }}>🏆 Elite Open Source Strategy</div>
                            <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Sustained Merged PRs:</strong> Target 20–50 meaningful merged pull requests (such as bug fixes, performance optimizations, or features rather than typos) to build real authority.</div>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Review Familiarity:</strong> Understand a complex codebase to the level where you can perform constructive code reviews on other developers' submissions.</div>
                              <div><strong style={{ color: T1 }}>GSoC Focus:</strong> Mentors value steady, high-quality, continuous contributions, active discussion before coding, and clean test integrations far more than singular, flashy standalone projects.</div>
                            </div>
                          </div>
                        )}

                        {i === 2 && (
                          <div style={{ marginTop: "16px", background: "rgba(52, 211, 153, 0.03)", border: "1px solid rgba(52, 211, 153, 0.15)", borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#34D399", fontWeight: "800", marginBottom: "8px", textTransform: "uppercase" }}>💼 The 2028 Multi-Stack Resume</div>
                            <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Primary Language Stack:</strong> Expert Python (AI orchestration) + system-level C/C++ (high performance & low-latency execution).</div>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Complementary Stack:</strong> TypeScript (excellent for tooling, frontend preview components, and CLI development) + Advanced SQL (expert query optimization & schema design).</div>
                              <div><strong style={{ color: T1 }}>The Credentials:</strong> Elite roles at Frontier AI labs, quant firms, and top infrastructure startups require solid evidence of debugging massive distributed systems, not just simple wrappers.</div>
                            </div>
                          </div>
                        )}

                        {i === 3 && (
                          <div style={{ marginTop: "16px", background: "rgba(251, 191, 36, 0.03)", border: "1px solid rgba(251, 191, 36, 0.15)", borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#FBBF24", fontWeight: "800", marginBottom: "8px", textTransform: "uppercase" }}>📖 The Primary Sources Rule</div>
                            <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Say No to Video Loops:</strong> passive consumption of short summary videos creates a false sense of learning. Top engineers consume documentation.</div>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>The Sources:</strong> Always read RFCs, official manual specifications, open-source repository commit logs, and arXiv research papers directly.</div>
                              <div><strong style={{ color: T1 }}>Compounding Knowledge:</strong> Build rich mental models. Kleppmann's DDIA is non-negotiable. Then consume technical blogs (Cloudflare, Netflix, Stripe) to understand systems at high scale.</div>
                            </div>
                          </div>
                        )}

                        {i === 4 && (
                          <div style={{ marginTop: "16px", background: "rgba(248, 113, 113, 0.03)", border: "1px solid rgba(248, 113, 113, 0.15)", borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#F87171", fontWeight: "800", marginBottom: "8px", textTransform: "uppercase" }}>✍️ Writing as an Engineering Force Multiplier</div>
                            <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Precision Over Vagueness:</strong> If you cannot explain it clearly in writing, you do not understand it. Writing forces you to resolve architectural ambiguities.</div>
                              <div style={{ marginBottom: "6px" }}><strong style={{ color: T1 }}>Production Writing artifacts:</strong> Practice writing professional README files, architectural design proposals (RFCs), API design logs, and detailed pull request summaries.</div>
                              <div><strong style={{ color: T1 }}>Engineering Brand:</strong> Clear communication is what differentiates a standard developer from an AI Systems leader. Share your design trade-offs publicly.</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="elite"&&(
          <div className="rm-fade" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header section with high caliber quote */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: "-10px", top: "-10px", fontSize: "72px", fontWeight: "900", color: "rgba(251, 191, 36, 0.03)", pointerEvents: "none", userSelect: "none" }}>1%</div>
              <div style={{ fontSize: "9px", letterSpacing: "2.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Core Mindset & Leverage</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: T1, letterSpacing: "-0.4px", marginBottom: "8px" }}>Elite Systems Engineering Mastery</div>
              <div style={{ fontSize: "12px", color: T2, lineHeight: "1.65" }}>
                By 2028, the top 1% of systems engineers won't be defined by passive framework adoption, but by <span style={{ color: "#FBBF24", fontWeight: "700" }}>First-Principles Reasoning</span>, deep runtime fluency, and relentless mastery across the computing stack. Leverage is built on compounding fundamentals.
              </div>
            </div>

            {/* The 8 Engineering Layers (Accordion Stack) */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>🛡️ The 8 Engineering Layers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  {
                    level: "L0",
                    name: "Engineering Mindset",
                    color: "#FBBF24",
                    desc: "The operating system of your career. First-principles reasoning, deep systems-level curiosity, comfort with high ambiguity, and intense extreme ownership of full-stack systems.",
                    bullets: ["First-Principles thinking (deconstruct to core physics)", "Systems thinking (view systems as complete feedback loops)", "Obsess over why components are built the way they are"]
                  },
                  {
                    level: "L1",
                    name: "Computer Science Foundations",
                    color: "#22D3EE",
                    desc: "The mathematical and physical rules of software execution.",
                    bullets: ["DSA Pattern Recognition: signal-to-pattern mapping", "Operating System Internals: context switches, page tables, system calls", "Networking Protocols: TCP/IP, sockets, multiplexing, transport safety", "Database Indexing: B-Trees, LSM-Trees, Hash indices, Query optimization"]
                  },
                  {
                    level: "L2",
                    name: "Software Engineering Core",
                    color: "#A78BFA",
                    desc: "Writing code that compounds safely across years.",
                    bullets: ["Python (Expert core, profiling, package execution)", "C/C++ (Memory manual layouts, pointer arithmetic, zero-overhead performance)", "TypeScript (Static type analysis, compiler tooling, high-scale web controls)", "Advanced SQL (Analytical queries, schema migrations, concurrency levels)"]
                  },
                  {
                    level: "L3",
                    name: "Distributed Systems",
                    color: "#F87171",
                    desc: "Scaling compute and state across multiple independent systems.",
                    bullets: ["Consensus Protocols: Raft, Paxos, multi-leader replication", "Data Consistency: CAP, PACELC, event sourcing, transactional safety", "Messaging Layers: Kafka, RabbitMQ, partition strategies"]
                  },
                  {
                    level: "L4",
                    name: "Cloud Infrastructure & SRE",
                    color: "#34D399",
                    desc: "Deploying and managing live production environments under active load.",
                    bullets: ["Container Orchestration: Docker execution layers, Kubernetes control planes", "Infrastructure-as-code: Terraform declarative state management", "Observability: Traces, metrics, logs, OpenTelemetry, Prometheus dashboards"]
                  },
                  {
                    level: "L5",
                    name: "AI Engineering & Retrieval",
                    color: "#EC4899",
                    desc: "Integrating frontier intelligence into responsive applications.",
                    bullets: ["ML Foundations: backpropagation, linear algebra, vector geometry", "Deep Learning frameworks: PyTorch neural architecture, custom loss layers", "RAG Systems: Hybrid retrieval, chunking pipelines, dense embeddings"]
                  },
                  {
                    level: "L6",
                    name: "Agent Orchestration",
                    color: "#38bdf8",
                    desc: "Coordinating multi-step planning and model feedback loops.",
                    bullets: ["Tool Calling: JSON Schemas, parameter parsing, runtime invocation", "Planning Cycles: ReAct, Tree of Thoughts, Hierarchical state machines", "Orchestration Libraries: LangGraph state preservation, Autogen conversations"]
                  },
                  {
                    level: "L7",
                    name: "AI Infrastructure & Serving",
                    color: "#F97316",
                    desc: "Optimizing low-latency execution and high hardware utilisation.",
                    bullets: ["Inference Engines: vLLM continuous batching, TensorRT graph compiler", "Hardware Optimization: CUDA memory layouts, tensor/pipeline parallelism", "Speculative Decoding: parallel small model drafting for low latency"]
                  },
                  {
                    level: "L8",
                    name: "Research & Frontier Governance",
                    color: "#10F5A0",
                    desc: "The emerging frontier of alignment, safety, and runtime control.",
                    bullets: ["Alignment: Constitutional AI feedback, RLHF preference pipelines", "Interpretability: mechanistic circuit mapping, feature probing", "Agent Runtime Governance: sandboxed interpreters, declarative Open Policy Agent (OPA) gates"]
                  }
                ].map((layer, idx) => {
                  const isExp = trkExp === `layer_${idx}`;
                  return (
                    <div key={layer.level} style={{ background: "rgba(255,255,255,0.01)", border: `1px solid ${isExp ? layer.color + "33" : "rgba(255,255,255,0.04)"}`, borderRadius: "8px", overflow: "hidden", transition: "all 0.2s" }} className="rm-card">
                      <div style={{ display: "flex", alignItems: "center", justify: "space-between", padding: "10px 12px", cursor: "pointer" }} onClick={() => setTrkExp(isExp ? null : `layer_${idx}`)}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", color: layer.color, background: `${layer.color}15`, padding: "2px 6px", borderRadius: "4px", border: `1px solid ${layer.color}25` }}>{layer.level}</span>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: T1 }}>{layer.name}</span>
                        </div>
                        <span style={{ color: isExp ? layer.color : T3, fontSize: "9px" }}>{isExp ? "▲" : "▼"}</span>
                      </div>
                      {isExp && (
                        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.15)" }}>
                          <div style={{ fontSize: "11px", color: T2, lineHeight: "1.6", marginBottom: "8px" }}>{layer.desc}</div>
                          <div style={{ fontSize: "9px", letterSpacing: "1px", color: T3, fontWeight: "800", textTransform: "uppercase", marginBottom: "6px" }}>Core Competency Targets</div>
                          {layer.bullets.map((b, bi) => (
                            <div key={bi} style={{ display: "flex", gap: "6px", alignItems: "flex-start", marginBottom: "4px" }}>
                              <span style={{ color: layer.color, fontSize: "9px", marginTop: "2px" }}>▪</span>
                              <span style={{ fontSize: "11px", color: T2 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* The 24 Differentiators Dynamic Grid */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase" }}>⚡ The 24 Differentiators of the Top 1%</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {["all", "mindset", "execution", "leverage"].map(cat => (
                    <button key={cat} onClick={() => { setEliteActiveCategory(cat); setEliteExpandedDifferentiator(null); }} className="rm-btn" style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "4px", background: eliteActiveCategory === cat ? "rgba(251, 191, 36, 0.15)" : "transparent", color: eliteActiveCategory === cat ? "#FBBF24" : T3, fontWeight: "600", textTransform: "capitalize" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                {[
                  {
                    id: 1, cat: "mindset", title: "First Principles", tag: "Challenge assumptions",
                    desc: "Deconstruct problems to their core physical and logical truths. Never say 'that's how we always do it.'",
                    practice: "When learning a new technology (e.g. Docker), list its core dependencies (cgroups, namespaces, union file systems) and explain how they construct the isolation layer."
                  },
                  {
                    id: 2, cat: "mindset", title: "Systems Thinking", tag: "Map entire flow loops",
                    desc: "Understand that no component exists in isolation. Analyze the feedback loop of the user journey, network paths, and runtime gates.",
                    practice: "Draw and detail the entire flow of an LLM query, detailing token delays, TCP handshakes, vLLM scheduling, and DB retrieval overhead."
                  },
                  {
                    id: 3, cat: "mindset", title: "Build Mental Models", tag: "Reject surface syntax",
                    desc: "Don't memorize API methods. Understand the memory layout, hashing collisions, resizing triggers, and file system limits.",
                    practice: "Implement a basic custom hash table with closed addressing/chaining from scratch in C or Python to fully model lookup bottlenecks."
                  },
                  {
                    id: 4, cat: "mindset", title: "Learn to Learn", tag: "Study technical history",
                    desc: "Deconstruct why a tool was created, what came before it, what issues it resolved, and what exact tradeoffs it introduced.",
                    practice: "Compare REST, gRPC, and WebSockets. Note down exactly when and why you should select one over the others."
                  },
                  {
                    id: 5, cat: "mindset", title: "Obsess Over Fundamentals", tag: "Stable layers compound",
                    desc: "Frameworks die; algorithms, operating systems, networks, and databases remain constant over decades.",
                    practice: "Dedicate 80% of your foundational study to Linux processes, memory virtualization, TCP transport states, and SQL transaction levels."
                  },
                  {
                    id: 6, cat: "mindset", title: "Pattern Recognition", tag: "Signal to pattern maps",
                    desc: "Train your brain to recognize the architectural and algorithmic signature of problems inside 60 seconds.",
                    practice: "When studying problems, actively group them. If you see 'longest subarray without repeats', think sliding window instantly."
                  },
                  {
                    id: 7, cat: "mindset", title: "Learn Tradeoffs", tag: "No free lunches",
                    desc: "Every design choice is a strict compromise. Weigh speed vs consistency, read vs write overhead, cost vs availability.",
                    practice: "Whenever you propose an architecture, force yourself to write three clear negative tradeoffs of your proposed approach."
                  },
                  {
                    id: 8, cat: "mindset", title: "Build Taste", tag: "Aesthetic & design standards",
                    desc: "Cultivate high standards for API simplicity, descriptive naming, modular design, and robust test hygiene.",
                    practice: "Read through polished open-source libraries like FastAPI, or Rust's standard library, observing how cleanly variables are named."
                  },
                  {
                    id: 9, cat: "execution", title: "Read Source Code", tag: "Ultimate primary source",
                    desc: "Spend as much time reading production open-source code (e.g., PyTorch, vLLM, Langchain) as you do reading tutorials.",
                    practice: "Clone an open-source tool you use. Trace a single function call end-to-end through its raw GitHub files."
                  },
                  {
                    id: 10, cat: "execution", title: "Elite Debugging", tag: "Master diagnostics",
                    desc: "Become a detective. Master tracing, profilers (cProfile, valgrind), lock inspectors, and packet capture tools.",
                    practice: "Solve a complex bug by writing detailed tracing logs and analyzing CPU usage plots, rather than randomly changing code."
                  },
                  {
                    id: 11, cat: "execution", title: "Great Reading", tag: "Primary sources first",
                    desc: "Consume official manuals, RFC specifications, architectural whitepapers, and arXiv papers over passive videos.",
                    practice: "When learning about HTTP/2, read the official RFC specification directly rather than a blog summarizing it."
                  },
                  {
                    id: 12, cat: "execution", title: "Clear Communication", tag: "Force multiplier",
                    desc: "If you cannot explain it clearly to a junior, you do not understand it. Practice writing precise technical copy.",
                    practice: "Write an Architecture Decision Record (ADR) for every flagship project, explaining options and the selected path."
                  },
                  {
                    id: 13, cat: "execution", title: "Ask Better Questions", tag: "Inquiry with context",
                    desc: "Never ask open-ended questions like 'Why does this fail?' Show your logs, tried hypotheses, and precise execution context.",
                    practice: "Write questions in the format: 'Goal -> Expected -> Observed -> Hypothesis -> Traced Experiment 1, 2, 3 -> Precise blocker.'"
                  },
                  {
                    id: 14, cat: "execution", title: "Tech Blog Weekly", tag: "Learn scale lessons",
                    desc: "Read engineering articles from scale-leaders (Stripe, Cloudflare, Netflix, Airbnb) to study real production issues.",
                    practice: "Subscribe to and read at least one article a week from Cloudflare or Stripe, taking notes on how they handle reliability."
                  },
                  {
                    id: 15, cat: "execution", title: "Measure Everything", tag: "Data over intuition",
                    desc: "Do not guess latency, memory footprint, or database performance. Instrument and monitor your system's load metrics.",
                    practice: "Add OpenTelemetry tracers to your local Express server and plot TTFT and memory overhead on every API request."
                  },
                  {
                    id: 16, cat: "execution", title: "Journal Failures", tag: "Compound your mistakes",
                    desc: "Log every major bug, its root cause, how you resolved it, and what guardrails would prevent it from happening again.",
                    practice: "Maintain a simple private Markdown log of 'Engineering Failures' with detailed post-mortems and lessons."
                  },
                  {
                    id: 17, cat: "leverage", title: "Understand Scale", tag: "Build for compounding concurrency",
                    desc: "Always design systems by asking what breaks at 10 users, 10,000 users, and 10 million concurrent active connections.",
                    practice: "Benchmark your local Node/Express database routes under artificial load with tools like autocannon or k6."
                  },
                  {
                    id: 18, cat: "leverage", title: "Think Like a Maintainer", tag: "Write code for human readers",
                    desc: "Code is read 10x more than it's written. Write clean, self-documenting code with comprehensive assertions and unit tests.",
                    practice: "Review your own code after 3 weeks. If any section requires you to scratch your head, rewrite it for clarity."
                  },
                  {
                    id: 19, cat: "leverage", title: "Failure First", tag: "Anticipate faults",
                    desc: "Assume anything that can fail will fail. Build clean retry limits, exponential backoffs, circuit breakers, and state recoverability.",
                    practice: "Inject artificial network drops into your database connection and verify your app handles it with an elegant retry loop."
                  },
                  {
                    id: 20, cat: "leverage", title: "Reliability Focus", tag: "Predictable under load",
                    desc: "A feature isn't complete when it runs once. It's complete when it behaves predictably under high concurrency and failure states.",
                    practice: "Write stress tests for your API, checking memory leak profiles over 12 hours of steady mock requests."
                  },
                  {
                    id: 21, cat: "leverage", title: "Compounding Skills", tag: "Select foundational topics",
                    desc: "Focus on topics that unlock downstream subjects. For example, mastering Linux system calls makes Docker and Kubernetes intuitive.",
                    practice: "Map out your study timeline to ensure foundations (networking, OS) are solid before exploring high-level abstractions."
                  },
                  {
                    id: 22, cat: "leverage", title: "Engineering Judgment", tag: "Weigh operational tradeoffs",
                    desc: "Avoid the trap of premature optimization. Balance engineering complexity with business requirements. Simplest is best.",
                    practice: "Choose simple SQLite or local filesystem solutions over distributed databases if data complexity is low."
                  },
                  {
                    id: 23, cat: "leverage", title: "Build Known Profile", tag: "Pre-empt opportunities",
                    desc: "Contribute to popular open-source repos, write public post-mortems, and establish your technical identity before you apply.",
                    practice: "Write and publish a deep breakdown on Hashnode about how you optimized an inference engine or designed an agent proxy."
                  },
                  {
                    id: 24, cat: "leverage", title: "High-Leverage Work", tag: "Avoid busywork",
                    desc: "Differentiate between real learning and passive consumption. Focus on activities with high compounding returns over years.",
                    practice: "Instead of watching another 4-hour tutorial, build a complex distributed queue system from scratch and write a design doc."
                  }
                ].filter(item => eliteActiveCategory === "all" || item.cat === eliteActiveCategory).map(item => {
                  const isExp = eliteExpandedDifferentiator === item.id;
                  return (
                    <div key={item.id} onClick={() => setEliteExpandedDifferentiator(isExp ? null : item.id)} style={{ background: isExp ? CARD2 : "rgba(255,255,255,0.015)", border: `1px solid ${isExp ? "#FBBF24" : "rgba(255,255,255,0.04)"}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", transition: "all 0.22s ease", display: "flex", flexDirection: "column", gap: "4px", boxShadow: isExp ? "0 0 12px rgba(251, 191, 36, 0.08)" : "none" }} className="rm-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: isExp ? "#FBBF24" : T1 }}>{item.title}</span>
                        <span style={{ fontSize: "7.5px", background: item.cat === "mindset" ? "rgba(34, 211, 238, 0.08)" : item.cat === "execution" ? "rgba(167, 139, 250, 0.08)" : "rgba(52, 211, 153, 0.08)", color: item.cat === "mindset" ? "#22D3EE" : item.cat === "execution" ? "#A78BFA" : "#34D399", padding: "1px 5px", borderRadius: "3px", fontWeight: "700", textTransform: "uppercase" }}>{item.cat}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: T3, fontStyle: "italic" }}>{item.tag}</div>
                      {isExp && (
                        <div style={{ fontSize: "11px", color: T2, marginTop: "6px", lineHeight: "1.55" }}>
                          {item.desc}
                          <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px 10px" }}>
                            <div style={{ fontSize: "8.5px", color: "#FBBF24", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>🔧 HOW TO PRACTICE IT</div>
                            <div style={{ fontSize: "10.5px", color: T2 }}>{item.practice}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STATEFUL INTERACTIVE CHECKLIST */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px" }}>
              {(() => {
                const totalChecks = 20;
                const checkedCount = Object.keys(eliteDone).filter(k => eliteDone[k]).length;
                const pctChecked = Math.round((checkedCount / totalChecks) * 100);
                
                const toggleCheck = (id) => {
                  const updated = { ...eliteDone, [id]: !eliteDone[id] };
                  setEliteDone(updated);
                  ls.set("rmx_elite_done", updated);
                  triggerSaveSync();
                };

                const checklistCategories = [
                  {
                    name: "🧠 KNOWLEDGE STANDARDS",
                    color: "#22D3EE",
                    items: [
                      { id: "e1", txt: "Ecosystem Familiarity", sub: "Fluent with systems tradeoffs of Python, C/C++, TypeScript, SQL, Bash, Go, and Rust." },
                      { id: "e2", txt: "Security Fundamentals", sub: "Understands OAuth flows, securely store JWT tokens, TLS encryption, API security gates, and sandboxing." },
                      { id: "e3", txt: "Business & Cost Basics", sub: "Understands SaaS metrics (LTV, CAC, gross margin) and how computing infrastructure choices directly affect margins." },
                      { id: "e4", txt: "Product Alignment", sub: "Translates product features into concrete engineering metrics and prioritizes roadmap based on business tradeoffs." }
                    ]
                  },
                  {
                    name: "🛠️ CAPABILITY STANDARDS",
                    color: "#A78BFA",
                    items: [
                      { id: "e5", txt: "Reading Large Codebases", sub: "Active execution-flow tracing and commit-history study inside major open-source repositories." },
                      { id: "e6", txt: "Official Specs & Docs First", sub: "Rejecting video loops; always read the official manual specs and API docs first." },
                      { id: "e7", txt: "Scale Blog Summaries", sub: "Read and document scale, downtime, and performance write-ups from Stripe, Netflix, and Cloudflare." },
                      { id: "e8", txt: "arXiv Research Literacy", sub: "Analyzing distributed systems and machine learning arXiv papers for core assumptions and runtime viability." },
                      { id: "e9", txt: "Critiquing Complex Architectures", sub: "Spotting bottlenecks, single-points-of-failure, and scalability caps in proposed network architectures." },
                      { id: "e10", txt: "Performance Intuition", sub: "Predicting complexity classes, memory boundaries, and network overhead prior to execution." },
                      { id: "e11", txt: "Fermi Calculations (Estimates)", sub: "Calculating bandwidth, API costs, memory overhead, and storage profiles roughly on the back of an envelope." },
                      { id: "e12", txt: "Architecture Records (ADRs)", sub: "Writing precise design docs, tradeoff logs, and RFCs prior to writing feature codes." },
                      { id: "e13", txt: "End-to-End Containers", sub: "Shipping fully containerized systems with automated CI build pipelines and testing suites." },
                      { id: "e14", txt: "Perform Technical Reviews", sub: "Conducting code reviews focusing on typing precision, race conditions, edge-case leaks, and performance." },
                      { id: "e15", txt: "Asking High-Caliber Questions", sub: "Framing technical questions with deep tracing contexts, tried theories, and boundary bounds." },
                      { id: "e16", txt: "Systematic Error Logs", sub: "Journaling debugging post-mortems, identifying systemic flaws, and applying permanent coding habit patches." }
                    ]
                  },
                  {
                    name: "🏆 REPUTATION & INDUSTRY BRAND",
                    color: "#34D399",
                    items: [
                      { id: "e17", txt: "Professional Habit Integrity", sub: "Descriptive semantic git logs, clean changelogs, branch protection, and robust test pipelines." },
                      { id: "e18", txt: "Simplification of Tradeoffs", sub: "Communicating complex architectural choices simply, clearly articulating tradeoffs to both business and dev teams." },
                      { id: "e19", txt: "Frontier Ecosystem Tracking", sub: "Tracking major model architectures, hardware constraints, and emerging open protocols like MCP." },
                      { id: "e20", txt: "Highly Verifiable Specialization", sub: "Maintaining a clean professional identity (e.g., 'I optimize low-latency distributed inference engines')." }
                    ]
                  }
                ];

                return (
                  <div>
                    {/* Mastery score indicator */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div>
                        <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase" }}>🏆 Elite Mastery Readiness Checklist</div>
                        <div style={{ fontSize: "11px", color: T3, marginTop: "2px" }}>Progress: {checkedCount} of {totalChecks} milestones completed</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#FBBF24" }}>{pctChecked}%</span>
                        <div style={{ width: "80px", height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${pctChecked}%`, height: "100%", background: "linear-gradient(90deg, #FBBF24, #10F5A0)", transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {checklistCategories.map(cat => (
                        <div key={cat.name}>
                          <div style={{ fontSize: "9px", letterSpacing: "1px", color: cat.color, fontWeight: "800", marginBottom: "8px", textTransform: "uppercase" }}>{cat.name}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
                            {cat.items.map(item => {
                              const checked = !!eliteDone[item.id];
                              return (
                                <div key={item.id} onClick={() => toggleCheck(item.id)} style={{ background: "rgba(255,255,255,0.01)", border: `1px solid ${checked ? cat.color + "35" : "rgba(255,255,255,0.03)"}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", transition: "all 0.18s ease", display: "flex", gap: "10px", alignItems: "flex-start" }} className="rm-card">
                                  <div style={{ width: "15px", height: "15px", borderRadius: "3px", border: `1px solid ${checked ? cat.color : T3}`, background: checked ? `${cat.color}15` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: cat.color, flexShrink: 0, marginTop: "1px" }}>{checked ? "✓" : ""}</div>
                                  <div>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: checked ? T1 : T2, transition: "color 0.2s" }}>{item.txt}</div>
                                    <div style={{ fontSize: "9.5px", color: T3, marginTop: "2px", lineHeight: "1.4" }}>{item.sub}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* WEEKLY RITUAL TRACKER */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase" }}>📅 Interactive Weekly Habit Ritual</div>
                  <div style={{ fontSize: "10px", color: T3, marginTop: "2px" }}>Complete these 10 actions every week. Compound your progress.</div>
                </div>
                <button onClick={() => { if(confirm("Reset weekly habits?")) { setWeeklyHabits({}); ls.set("rmx_weekly_habits", {}); triggerSaveSync(); } }} className="rm-btn" style={{ fontSize: "9px", padding: "3px 8px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "4px", color: "#EF4444", fontWeight: "700" }}>
                  RESET WEEK
                </button>
              </div>

              {(() => {
                const habitsList = [
                  "Deep-dive one core concept from first principles.",
                  "Read official documentation/specifications for a tool you are using.",
                  "Explore and trace part of a large open-source codebase.",
                  "Read and take notes on one engineering blog post or arXiv research paper.",
                  "Solve DSA practice problems with emphasis on problem signal mapping.",
                  "Review code (someone else's repository or your own previous code).",
                  "Write a short technical markdown note summarizing key lessons.",
                  "Deconstruct and analyze one real-world software system architecture.",
                  "Reflect on one engineering error and document habit patches.",
                  "Stay informed on frontier model releases and open-source updates."
                ];

                const toggleHabit = (idx) => {
                  const updated = { ...weeklyHabits, [idx]: !weeklyHabits[idx] };
                  setWeeklyHabits(updated);
                  ls.set("rmx_weekly_habits", updated);
                  triggerSaveSync();
                };

                const activeCount = habitsList.filter((_, idx) => !!weeklyHabits[idx]).length;

                return (
                  <div>
                    <div style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", display: "grid", gap: "7px", marginBottom: "12px" }}>
                      {habitsList.map((habit, idx) => {
                        const checked = !!weeklyHabits[idx];
                        return (
                          <div key={idx} onClick={() => toggleHabit(idx)} style={{ background: "rgba(255,255,255,0.01)", border: `1px solid ${checked ? "#FBBF2445" : "rgba(255,255,255,0.03)"}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", transition: "all 0.18s ease", display: "flex", gap: "10px", alignItems: "flex-start" }} className="rm-card">
                            <div style={{ width: "15px", height: "15px", borderRadius: "3px", border: `1px solid ${checked ? "#FBBF24" : T3}`, background: checked ? "rgba(251, 191, 36, 0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#FBBF24", flexShrink: 0, marginTop: "1px" }}>{checked ? "✓" : ""}</div>
                            <span style={{ fontSize: "11px", color: checked ? T1 : T2, transition: "color 0.2s" }}>{habit}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: "10px", color: T3, textAlign: "right" }}>Weekly score: {activeCount} / 10 habits completed</div>
                  </div>
                );
              })()}
            </div>

            {/* THE SUNDAY SELF-REFLECTION DIARY */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: "11px", padding: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#FBBF24", fontWeight: "700", textTransform: "uppercase" }}>📓 The Sunday Reflection Diary</div>
                <div style={{ fontSize: "10px", color: T3, marginTop: "2px" }}>Every Sunday, ask yourself these 6 questions. Take written logs of your development.</div>
              </div>

              {(() => {
                const questions = [
                  { key: "q1", label: "What did I deeply understand this week from first principles?" },
                  { key: "q2", label: "What core assumption did I actively challenge?" },
                  { key: "q3", label: "What specific system can I now explain end-to-end to a junior?" },
                  { key: "q4", label: "What did I build that improved my professional engineering habits?" },
                  { key: "q5", label: "What concrete feedback did I act on?" },
                  { key: "q6", label: "What can I do next week that compounds over the next three years?" }
                ];

                const handleAnswerChange = (key, val) => {
                  const updated = { ...eliteSundayAnswers, [key]: val };
                  setEliteSundayAnswers(updated);
                  ls.set("rmx_sunday_answers", updated);
                  triggerSaveSync();
                };

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                    {questions.map(q => (
                      <div key={q.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: T1 }}>{q.label}</span>
                        <textarea
                          value={eliteSundayAnswers[q.key] || ""}
                          onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                          placeholder="Type your reflection here..."
                          style={{
                            width: "100%",
                            height: "65px",
                            background: "rgba(5, 14, 30, 0.5)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "6px",
                            padding: "8px",
                            color: T2,
                            fontSize: "11px",
                            fontFamily: "var(--font-sans)",
                            resize: "none",
                            outline: "none",
                            transition: "border-color 0.2s"
                          }}
                          onFocus={(e) => e.target.style.borderColor = "rgba(251, 191, 36, 0.4)"}
                          onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.05)"}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {tab==="progress"&&(
          <div className="rm-fade" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"13px",padding:"22px",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
              <BigRing p={totalPct} color={totalPct===100?"#10F5A0":totalPct>50?"#FBBF24":"#FF2D78"} size={108}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:T1}}>{allDone} of {allItems} topics completed</div>
                <div style={{fontSize:"10px",color:T3,marginTop:"3px"}}>{compMonths} months fully done · {MONTHS.filter(m=>pct(m,done)>0&&pct(m,done)<100).length} in progress</div>
              </div>
            </div>

            {/* Interactive Progress Over Time Chart */}
            <RoadmapChart done={done} />

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"7px"}}>
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
            <div style={{background:CARD,border:`1px solid ${BDR}`,borderRadius:"10px",padding:"14px 16px"}}>
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

        {tab==="systems"&&(
          <SystemsLab audioEnabled={audioEnabled} />
        )}
      </div>
    </main>
  </div>

  {/* Persistent Note Drawer */}
  <ModuleNoteDrawer activeMonth={activeNoteMonth} onClose={() => setActiveNoteMonth(null)} onSave={triggerSaveSync} />

  {/* Focused Module Modal Reader */}
  <ModuleFocusedReader
    activeMonth={exp}
    onClose={() => setExp(null)}
    done={done}
    toggleDone={toggleDone}
    toggleTopicDone={toggleTopicDone}
    markAll={markAll}
    resetMonth={resetMonth}
    bkm={bkm}
    toggleBkm={toggleBkm}
    searchQuery={searchQuery}
    selectedDiff={selectedDiff}
    selectedDomain={selectedDomain}
    setActiveNoteMonth={setActiveNoteMonth}
    resOpen={resOpen}
    setResOpen={setResOpen}
    csOpen={csOpen}
    setCsOpen={setCsOpen}
  />

  {/* Celebratory Animation Overlay */}
  <CelebrationOverlay active={confetti !== null} />

  {/* Elegant Floating Portal Orb & Settings Trigger */}
  <div style={{
    position: "fixed",
    top: "18px",
    right: "24px",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}>
    <button
      onClick={() => {
        setPortalOpen(prev => {
          const next = !prev;
          playSweepSound(audioEnabled, next);
          return next;
        });
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 hover:border-[#A78BFA]/40 transition-all duration-300"
      style={{
        background: "rgba(10, 22, 40, 0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
      }}
    >
      <div className="relative flex items-center justify-center">
        {user ? (
          user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full border border-[#10F5A0]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#A78BFA] text-black flex items-center justify-center text-xs font-bold font-mono">
              {user.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
          )
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/20">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
        )}
        {/* Pulsing neon status indicator dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user ? "bg-[#10F5A0]" : "bg-cyan-400"}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${user ? "bg-[#10F5A0]" : "bg-cyan-500"}`}></span>
        </span>
      </div>

      <span className="text-[10px] font-mono tracking-wider font-semibold text-[#E2E8F0] uppercase">
        {user ? user.displayName?.split(" ")[0] || "Portal" : "Flow Portal"}
      </span>
      
      <Sparkles className={`w-3.5 h-3.5 transition-all duration-500 ${portalOpen ? "text-pink-500 rotate-180" : "text-[#A78BFA]"}`} />
    </button>
  </div>

  {/* Animated Side-drawer Sheet */}
  <AnimatePresence>
    {portalOpen && (
      <>
        {/* Backdrop glass blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setPortalOpen(false);
            playSweepSound(audioEnabled, false);
          }}
          className="fixed inset-0"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
        />

        {/* Sliding drawer panel container */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 190 }}
          className="border-l border-white/10 shadow-2xl flex flex-col font-sans select-none text-white overflow-hidden"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "100%",
            maxWidth: "480px",
            zIndex: 1001,
            backgroundColor: "rgba(3, 8, 18, 0.72)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "-12px 0 40px rgba(0,0,0,0.85), inset 1px 0 0 rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-sans)",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between" style={{ background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(10px)" }}>
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 shadow-[0_0_15px_rgba(167,139,250,0.15)] flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#A78BFA] animate-pulse" />
              </div>
              <div>
                <div className="text-[9px] tracking-[0.18em] font-mono text-[#A78BFA]/90 font-bold uppercase leading-none mb-1">SYSTEMS INTEGRITY</div>
                <div className="text-xs font-mono font-black text-slate-100 tracking-wide uppercase">FLOW 16 SECTORS PORTAL</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setPortalOpen(false);
                playSweepSound(audioEnabled, false);
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#A78BFA]/30 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Top Profile Section (Pinned below Header) */}
          <div className="p-4 border-b border-white/10 bg-slate-900/40 flex-shrink-0">
            {authLoading ? (
              <div className="py-3 text-center text-slate-400 text-xs font-mono animate-pulse flex flex-col items-center justify-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
                <span className="text-[10px] tracking-wide">Verifying secure workspace handshake…</span>
              </div>
            ) : user ? (
              /* Connected User Profile Block */
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
                {/* Visual Ambient Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#A78BFA]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-[#A78BFA] shadow-[0_0_12px_rgba(167,139,250,0.25)] object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#A78BFA]/20 border-2 border-[#A78BFA] text-[#A78BFA] flex items-center justify-center font-mono font-black text-sm shadow-[0_0_12px_rgba(167,139,250,0.15)]">
                        {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10F5A0] border-2 border-slate-950 animate-pulse" />
                  </div>
                  
                  <div className="min-w-0 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-100 truncate max-w-[150px]">
                        {user.displayName || "Explorer"}
                      </span>
                      {user.isSandbox ? (
                        <span className="text-[7px] tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-black">
                          SANDBOX
                        </span>
                      ) : (
                        <span className="text-[7px] tracking-wider px-1.5 py-0.5 rounded-full bg-[#10F5A0]/10 text-[#10F5A0] border border-[#10F5A0]/20 uppercase font-black">
                          SECURE
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5 max-w-[200px]">
                      {user.email || "sandbox@flow16.local"}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 flex items-center gap-1 mt-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-[#10F5A0]" />
                      CLOUD METRICS ACTIVE
                    </div>
                  </div>
                </div>

                {/* Small Disconnect Link/Button */}
                <button
                  onClick={handleDisconnect}
                  className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 text-red-400 text-[8px] font-mono font-bold tracking-wider transition-all duration-200 uppercase"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              /* Unauthenticated Session / Google Sign In Form */
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800/40 border border-white/10 text-slate-400 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="font-mono">
                    <div className="text-xs font-bold text-slate-200">SESSION HANDSHAKE</div>
                    <div className="text-[9px] text-slate-500">Connect progress to Google Cloud or Sandbox</div>
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-mono text-red-400 leading-normal">
                    ⚠ {authError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 hover:bg-[#A78BFA]/10 text-[9px] font-mono font-bold text-slate-300 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" className="flex-shrink-0">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13c0-3.04 2.46-5.514 5.5-5.514 1.342 0 2.57.486 3.524 1.286l3.057-3.057C18.733 3.943 16.514 3 14 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10c5.52 0 10-4.48 10-10 0-.685-.06-1.354-.171-2H12.24z"/>
                    </svg>
                    CONNECT GOOGLE IDENTITY
                  </button>

                  <div className="flex items-center gap-2 py-0.5">
                    <span className="h-px bg-white/5 flex-1" />
                    <span className="text-[7px] font-mono tracking-widest text-slate-600 uppercase font-black">OR BYPASS SECURE HANDSHAKE</span>
                    <span className="h-px bg-white/5 flex-1" />
                  </div>

                  <form onSubmit={handleSandboxLogin} className="flex gap-2">
                    <input
                      type="text"
                      value={sandboxName}
                      onChange={e => setSandboxName(e.target.value)}
                      placeholder="Enter hacker handle (e.g. Neo)..."
                      className="flex-1 bg-slate-950/60 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#A78BFA]/30 focus:ring-1 focus:ring-[#A78BFA]/15 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!sandboxName.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/20 text-[9px] font-mono font-bold tracking-wider transition-all disabled:opacity-40"
                    >
                      LOGIN
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Settings & Footer Area */}
          <div className="border-t border-white/10 flex-1 overflow-y-auto no-scrollbar bg-slate-950/40">
            <button
                onClick={() => {
                  setVesselSettingsOpen(!vesselSettingsOpen);
                  playSweepSound(audioEnabled, !vesselSettingsOpen);
                }}
                className="w-full px-4 py-2.5 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors font-mono text-[9px] tracking-widest font-black uppercase"
              >
                <span className="flex items-center gap-1.5">
                  <span>⚙️</span> VESSEL SYSTEMS & MODE CONTROLS
                </span>
                <span>{vesselSettingsOpen ? "▲ CLOSE" : "▼ OPEN"}</span>
              </button>

              <AnimatePresence>
                {vesselSettingsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 px-4 pb-4 space-y-4 pt-3 bg-slate-950/60"
                  >
                    {/* Ambient Star Speed Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[9px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-yellow-400 animate-spin" style={{ animationDuration: "6s" }} />
                          AMBIENT UNIVERSE SPEED
                        </span>
                        <span className="text-[#A78BFA] font-bold">{starSpeed.toFixed(1)}x</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono text-slate-500">0.2x</span>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={starSpeed}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setStarSpeed(val);
                            localStorage.setItem("rmx_star_speed", String(val));
                          }}
                          className="flex-1 accent-[#A78BFA] bg-slate-900 rounded-lg h-1"
                        />
                        <span className="text-[8px] font-mono text-slate-500">3.0x</span>
                      </div>
                    </div>

                    {/* Audio feedback sound toggle */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2 font-mono">
                        {audioEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-[#10F5A0]" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <div>
                          <div className="text-[9px] font-bold text-slate-300">SYNTH SOUND EFFECTS</div>
                          <div className="text-[7.5px] text-slate-500 font-bold">Dual-tone thrum alerts when checking items</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setAudioEnabled(prev => {
                            const next = !prev;
                            localStorage.setItem("rmx_audio_enabled", String(next));
                            playSuccessBeep(next);
                            return next;
                          });
                        }}
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-300 flex items-center ${audioEnabled ? "bg-[#10F5A0] justify-end" : "bg-slate-800 justify-start"}`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-900 shadow-md" />
                      </button>
                    </div>

                    {/* Safety Clear Logs Progress Reset Action */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="font-mono">
                        <div className="text-[9px] font-bold text-slate-300">SAFETY DEEP CLEAN</div>
                        <div className="text-[7.5px] text-slate-500">Wipes local completed roadmap metrics</div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently wipe your local completed roadmap milestones from this machine.")) {
                            localStorage.removeItem("rmx_done");
                            localStorage.removeItem("rmx_bkm");
                            localStorage.removeItem("rmx_weekly_habits");
                            localStorage.removeItem("rmx_elite_done");
                            setDone({});
                            setBkm({});
                            setWeeklyHabits({});
                            setEliteDone({});
                            playSweepSound(audioEnabled, false);
                            setPortalOpen(false);
                            window.location.reload();
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/35 text-red-400 font-mono text-[8px] tracking-widest uppercase font-black transition-all duration-200"
                      >
                        WIPE CHANNELS
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer status credits bar */}
              <div className="p-2 border-t border-white/10 text-center font-mono text-[8px] text-slate-600 bg-black/40">
                FLOW_16_SYSTEMS_CORE // STATUS: COGNITIVE_ACTIVE
              </div>
            </div>
          </motion.div>
      </>
    )}
  </AnimatePresence>

  {/* Celebratory Animation Overlay */}
  <CelebrationOverlay active={confetti !== null} />
</div>
  );
}

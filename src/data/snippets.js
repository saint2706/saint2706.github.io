// Curated code snippets for the Playground page
// Focus: Advanced, impressive one-liners and techniques

export const snippets = [
  // ===== PYTHON ONE-LINERS =====
  {
    id: 'py-flatten',
    title: 'Recursive List Flattening',
    description:
      'Flatten arbitrarily nested lists using recursion in a single expression. Try different nested structures!',
    code: `flatten = lambda x: [i for s in x for i in (flatten(s) if isinstance(s, list) else [s])]
# Example:
data = [1, [2, 3, [4, 5]], [6, [7, 8, [9]]]]
print(flatten(data))`,
    language: 'python',
    category: 'Data Structures',
    tags: ['recursion', 'lists', 'functional', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '[1, [2, 3, [4, 5]], [6, [7, 8, [9]]]]',
      inputLabel: 'Enter nested list (e.g. [1, [2, [3]]])',
      codeTemplate:
        () => `import ast
flatten = lambda x: [i for s in x for i in (flatten(s) if isinstance(s, list) else [s])]
try:
    data = ast.literal_eval(user_input)
except:
    data = []
    print("Error: Invalid list format")
print(f"Input: {data}")
print(f"Flattened: {flatten(data)}")`,
    },
  },
  {
    id: 'py-fizzbuzz',
    title: 'FizzBuzz One-Liner',
    description:
      'The classic interview problem solved in a single list comprehension. Change the range!',
    code: `print(*[("Fizz"*(i%3==0)+"Buzz"*(i%5==0)) or i for i in range(1,101)], sep="\\n")`,
    language: 'python',
    category: 'Algorithms',
    tags: ['interview', 'classic', 'comprehension', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '30',
      inputLabel: 'FizzBuzz up to N',
      codeTemplate: () => `try:
    n = int(user_input)
except:
    n = 30
result = [("Fizz"*(i%3==0)+"Buzz"*(i%5==0)) or i for i in range(1, n+1)]
print("\\n".join(str(x) for x in result))`,
    },
  },
  {
    id: 'py-quicksort',
    title: 'Quicksort Lambda',
    description: 'Recursive quicksort implemented as a lambda function. Enter numbers to sort!',
    code: `qsort = lambda x: [] if not x else qsort([i for i in x[1:] if i < x[0]]) + [x[0]] + qsort([i for i in x[1:] if i >= x[0]])`,
    language: 'python',
    category: 'Algorithms',
    tags: ['sorting', 'recursion', 'lambda', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '64, 34, 25, 12, 22, 11, 90',
      inputLabel: 'Enter numbers (comma-separated)',
      codeTemplate:
        () => `qsort = lambda x: [] if not x else qsort([i for i in x[1:] if i < x[0]]) + [x[0]] + qsort([i for i in x[1:] if i >= x[0]])
try:
    data = [int(x.strip()) for x in user_input.split(',')]
except:
    data = []
    print("Error: Invalid numbers")
print(f"Unsorted: {data}")
print(f"Sorted:   {qsort(data)}")`,
    },
  },
  {
    id: 'py-primes',
    title: 'Prime Number Generator',
    description:
      'Generate primes using the Sieve of Eratosthenes in one line. Find all primes up to N!',
    code: `primes = lambda n: [x for x in range(2, n) if all(x % i for i in range(2, int(x**0.5)+1))]`,
    language: 'python',
    category: 'Math',
    tags: ['primes', 'sieve', 'math', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '50',
      inputLabel: 'Find primes up to N',
      codeTemplate:
        () => `primes = lambda n: [x for x in range(2, n) if all(x % i for i in range(2, int(x**0.5)+1))]
try:
    n = int(user_input)
except:
    n = 50
    print("Error: Invalid number")
result = primes(n)
print(f"Primes up to {n}: {result}")
print(f"Count: {len(result)} primes")`,
    },
  },
  {
    id: 'py-transpose',
    title: 'Matrix Transpose',
    description: 'Transpose a 2D matrix using zip and unpacking. Try your own matrix!',
    code: `transpose = lambda m: list(map(list, zip(*m)))`,
    language: 'python',
    category: 'Data Structures',
    tags: ['matrix', 'zip', 'functional', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '[[1, 2, 3], [4, 5, 6], [7, 8, 9]]',
      inputLabel: 'Enter 2D matrix',
      codeTemplate: () => `import ast
transpose = lambda m: list(map(list, zip(*m)))
try:
    matrix = ast.literal_eval(user_input)
except:
    matrix = []
    print("Error: Invalid matrix")
result = transpose(matrix)
print("Original:")
for row in matrix: print(row)
print("\\nTransposed:")
for row in result: print(row)`,
    },
  },
  {
    id: 'py-memoize',
    title: 'Memoization Decorator',
    description: 'Cache function results for performance optimization. Watch the speed difference!',
    code: `memoize = lambda f: (d := {}) or (lambda *a: d.setdefault(a, f(*a)))`,
    language: 'python',
    category: 'Functional',
    tags: ['decorator', 'cache', 'walrus', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: '35',
      inputLabel: 'Calculate Fibonacci of N',
      codeTemplate: () => `import time
memoize = lambda f: (d := {}) or (lambda *a: d.setdefault(a, f(*a)))

# Without memoization (slow!)
fib_slow = lambda n: n if n < 2 else fib_slow(n-1) + fib_slow(n-2)

# With memoization (fast!)
fib_fast = memoize(lambda n: n if n < 2 else fib_fast(n-1) + fib_fast(n-2))

try:
    n = int(user_input)
except:
    n = 35
    print("Error: Invalid number")

start = time.time()
result = fib_fast(n)
fast_time = (time.time() - start) * 1000

print(f"Fibonacci({n}) = {result}")
print(f"Memoized time: {fast_time:.3f}ms")
print("(Without memoization, this would take MUCH longer for large N!)")`,
    },
  },
  {
    id: 'py-groupby',
    title: 'Group By Key',
    description: 'Group list items by a key function using reduce. Group words by length!',
    code: `group_by = lambda f, xs: __import__('functools').reduce(lambda d, x: d.setdefault(f(x), []).append(x) or d, xs, {})`,
    language: 'python',
    category: 'Functional',
    tags: ['reduce', 'grouping', 'functional', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: 'apple, banana, cherry, date, elderberry, fig',
      inputLabel: 'Enter words (comma-separated)',
      codeTemplate: () => `from functools import reduce
group_by = lambda f, xs: reduce(lambda d, x: d.setdefault(f(x), []).append(x) or d, xs, {})

words = [w.strip() for w in user_input.split(",")]
grouped = group_by(len, words)

print("Grouped by word length:")
for length, items in sorted(grouped.items()):
    print(f"  {length} letters: {items}")`,
    },
  },
  {
    id: 'py-combinations',
    title: 'All Combinations',
    description:
      'Generate all combinations using recursive list comprehension. Pick r items from a set!',
    code: `combos = lambda l, n: [l[:i] for i in range(n+1)] if n <= 1 else [[x]+y for i,x in enumerate(l) for y in combos(l[i+1:], n-1)]`,
    language: 'python',
    category: 'Algorithms',
    tags: ['combinations', 'recursion', 'math', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: 'A, B, C, D',
      inputLabel: 'Enter items (comma-separated)',
      codeTemplate:
        () => `combos = lambda l, n: [[]] if n == 0 else [[x]+y for i,x in enumerate(l) for y in combos(l[i+1:], n-1)]

items = [x.strip() for x in user_input.split(",")]
print(f"Items: {items}\\n")

for r in range(len(items)+1):
    c = combos(items, r)
    print(f"Choose {r}: {len(c)} combinations")
    if len(c) <= 15:
        for combo in c: print(f"  {combo}")`,
    },
  },
  {
    id: 'py-heart',
    title: 'ASCII Heart Generator',
    description:
      'Print a love heart filled with any name using mathematical equations. Enter your name and run real Python code! ❤️',
    code: `name = "Saint"
print('\\n'.join([''.join([(name[(x-y) % len(name)] if ((x*0.05)**2+(y*0.1)**2-1)**3-(x*0.05)**2*(y*0.1)**3 <= 0 else ' ') for x in range(-30, 30)]) for y in range(15, -15, -1)]))`,
    language: 'python',
    category: 'ASCII Art',
    tags: ['ascii', 'art', 'math', 'creative', 'interactive'],
    interactive: {
      type: 'python-runner',
      defaultInput: 'Saint',
      inputLabel: 'Enter your name',
      codeTemplate: () => `name = user_input
print('\\n'.join([''.join([(name[(x-y) % len(name)] if ((x*0.05)**2+(y*0.1)**2-1)**3-(x*0.05)**2*(y*0.1)**3 <= 0 else ' ') for x in range(-30, 30)]) for y in range(15, -15, -1)]))`,
    },
  },

  // ===== CSS SNIPPETS =====
  {
    id: 'css-glass',
    title: 'Glassmorphism Effect',
    description: 'Modern frosted glass UI effect with backdrop blur.',
    code: `.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}`,
    language: 'css',
    category: 'Effects',
    tags: ['glassmorphism', 'blur', 'modern'],
    preview: {
      html: '<div class="demo-glass">Glassmorphism</div>',
      css: `.demo-glass {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 60px;
        border-radius: 16px;
      }
      .demo-glass > div, .demo-glass {
        position: relative;
      }
      .demo-glass::after {
        content: 'Glassmorphism';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        padding: 20px 40px;
        color: white;
        font-weight: bold;
        font-size: 14px;
      }`,
    },
  },
  {
    id: 'css-gradient-text',
    title: 'Animated Gradient Text',
    description: 'Eye-catching text with animated flowing gradient.',
    code: `.gradient-text {
  background: linear-gradient(270deg, #ff6b6b, #4ecdc4, #45b7d1, #ff6b6b);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient-flow 4s ease infinite;
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}`,
    language: 'css',
    category: 'Text',
    tags: ['gradient', 'animation', 'text'],
    preview: {
      html: '<span class="gradient-text">Flowing Gradient</span>',
      css: `.gradient-text {
        background: linear-gradient(270deg, #ff6b6b, #4ecdc4, #45b7d1, #ff6b6b);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: gradient-flow 4s ease infinite;
        font-size: 24px;
        font-weight: bold;
      }
      @keyframes gradient-flow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }`,
    },
  },
  {
    id: 'css-neon',
    title: 'Neon Glow Effect',
    description: 'Cyberpunk-style neon text with pulsing animation.',
    code: `.neon {
  color: #fff;
  text-shadow:
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px #0ff,
    0 0 40px #0ff,
    0 0 80px #0ff;
  animation: neon-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes neon-pulse {
  from { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 40px #0ff; }
  to { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 40px #0ff, 0 0 80px #0ff; }
}`,
    language: 'css',
    category: 'Effects',
    tags: ['neon', 'glow', 'cyberpunk'],
    preview: {
      html: '<span class="neon">NEON</span>',
      css: `.neon {
        color: #fff;
        text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 40px #0ff, 0 0 80px #0ff;
        animation: neon-pulse 1.5s ease-in-out infinite alternate;
        font-size: 32px;
        font-weight: bold;
        font-family: monospace;
        background: #1a1a2e;
        padding: 20px 40px;
        border-radius: 8px;
      }
      @keyframes neon-pulse {
        from { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 40px #0ff; }
        to { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 40px #0ff, 0 0 80px #0ff; }
      }`,
    },
  },
  {
    id: 'css-hover-underline',
    title: 'Sliding Underline Hover',
    description: 'Elegant underline that slides in on hover.',
    code: `.hover-underline {
  position: relative;
  display: inline-block;
}

.hover-underline::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease-out;
}

.hover-underline:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}`,
    language: 'css',
    category: 'Hover',
    tags: ['underline', 'hover', 'animation'],
    preview: {
      html: '<a href="#" class="hover-underline">Hover Me</a>',
      css: `.hover-underline {
        position: relative;
        display: inline-block;
        color: #0052CC;
        text-decoration: none;
        font-size: 18px;
        font-weight: 600;
        padding: 4px 0;
      }
      .hover-underline::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        bottom: 0;
        left: 0;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: bottom right;
        transition: transform 0.3s ease-out;
      }
      .hover-underline:hover::after {
        transform: scaleX(1);
        transform-origin: bottom left;
      }`,
    },
  },
  {
    id: 'css-card-3d',
    title: '3D Card Tilt Effect',
    description: 'Interactive 3D perspective tilt on hover.',
    code: `.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.card-3d:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
}

.card-3d::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.card-3d:hover::before { opacity: 1; }`,
    language: 'css',
    category: 'Effects',
    tags: ['3d', 'perspective', 'hover'],
    preview: {
      html: '<div class="card-3d">Hover for 3D</div>',
      css: `.card-3d {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 60px;
        border-radius: 12px;
        color: white;
        font-weight: bold;
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
        position: relative;
        cursor: pointer;
      }
      .card-3d:hover {
        transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
      }
      .card-3d::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .card-3d:hover::before { opacity: 1; }`,
    },
  },
  {
    id: 'css-skeleton',
    title: 'Skeleton Loading Animation',
    description: 'Smooth shimmer effect for loading placeholders.',
    code: `.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`,
    language: 'css',
    category: 'Loading',
    tags: ['skeleton', 'loading', 'shimmer'],
    preview: {
      html: '<div class="skeleton-demo"><div class="skeleton"></div><div class="skeleton short"></div></div>',
      css: `.skeleton-demo {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
      }
      .skeleton {
        height: 20px;
        border-radius: 4px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .skeleton.short { width: 60%; }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }`,
    },
  },
  {
    id: 'css-scroll-snap',
    title: 'Scroll Snap Container',
    description: 'Smooth snap-to-item scrolling for carousels.',
    code: `.scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 1rem;
  -webkit-overflow-scrolling: touch;
}

.scroll-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}

/* Hide scrollbar but keep functionality */
.scroll-container::-webkit-scrollbar { display: none; }
.scroll-container { -ms-overflow-style: none; scrollbar-width: none; }`,
    language: 'css',
    category: 'Layout',
    tags: ['scroll', 'snap', 'carousel'],
    preview: {
      html: '<div class="scroll-container"><div class="scroll-item">1</div><div class="scroll-item">2</div><div class="scroll-item">3</div><div class="scroll-item">4</div></div>',
      css: `.scroll-container {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        gap: 12px;
        padding: 10px;
        -webkit-overflow-scrolling: touch;
      }
      .scroll-container::-webkit-scrollbar { display: none; }
      .scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
      .scroll-item {
        scroll-snap-align: start;
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 24px;
      }`,
    },
  },
  {
    id: 'css-responsive-clamp',
    title: 'Fluid Typography with clamp()',
    description: 'Responsive font sizing without media queries.',
    code: `.fluid-heading {
  /* Min 24px, preferred 5vw, max 72px */
  font-size: clamp(1.5rem, 5vw, 4.5rem);
  
  /* Fluid line-height */
  line-height: clamp(1.2, 1.1 + 0.5vw, 1.5);
  
  /* Fluid letter-spacing */
  letter-spacing: clamp(-0.02em, -0.01em + 0.1vw, 0.02em);
}`,
    language: 'css',
    category: 'Typography',
    tags: ['clamp', 'responsive', 'fluid'],
    preview: {
      html: '<h1 class="fluid-heading">Fluid Size</h1>',
      css: `.fluid-heading {
        font-size: clamp(1rem, 4vw, 2rem);
        line-height: 1.2;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-align: center;
      }`,
    },
  },
];

// Helper to get snippets by language
export const getSnippetsByLanguage = language => {
  if (language === 'all') return snippets;
  return snippets.filter(s => s.language === language);
};

// Get unique categories
export const getCategories = () => {
  return [...new Set(snippets.map(s => s.category))];
};

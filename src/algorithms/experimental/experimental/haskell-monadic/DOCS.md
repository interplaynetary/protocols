# Documentation Index

Welcome to the Commons Haskell library documentation!

## 📚 Documentation Files

### For Users

1. **[README.md](README.md)** - Start here!
   - Overview of the Commons paradigm
   - Quick start guide
   - Installation instructions
   - Key concepts and examples

2. **[API.md](API.md)** - Complete API Reference
   - Detailed documentation for every module
   - Function signatures and descriptions
   - Mathematical definitions
   - Comprehensive examples
   - **Best for**: Understanding what each function does

3. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common Patterns
   - Recipes for common use cases
   - Code snippets you can copy-paste
   - Debugging tips
   - Performance advice
   - **Best for**: Getting things done quickly

### Mathematical Foundations

6. **[commons.tex](commons.tex)** - Formal Specification
   - Complete mathematical formalism
   - Proofs and theorems
   - Formal definitions
   - **Best for**: Deep understanding of the theory

7. **[general.tex](general.tex)** - General Framework
   - Broader theoretical context
   - Sovereignty and ungameability
   - Design space analysis
   - **Best for**: Understanding the bigger picture

### Examples

8. **[app/Main.hs](app/Main.hs)** - Working Examples
   - Kitchen allocation
   - Satisfaction-weighted distribution
   - History accumulation
   - **Best for**: Seeing the library in action

## 🚀 Quick Navigation

### I want to...

**...get started quickly**
→ Read [README.md](README.md) Quick Start section

**...understand a specific function**
→ Check [API.md](API.md) for detailed documentation

**...solve a common problem**
→ Look in [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for patterns

**...understand the math**
→ Read [commons.tex](commons.tex) for formal definitions

**...see working code**
→ Check [app/Main.hs](app/Main.hs) for examples

## 📖 Reading Order

### For New Users

1. Start with [README.md](README.md) - Get the big picture
2. Try the Quick Start example
3. Browse [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Find patterns you need
4. Refer to [API.md](API.md) - When you need details
5. Read [commons.tex](commons.tex) - For deep understanding

### For Contributors

1. Read [README.md](README.md) - Understand the project
2. Read [commons.tex](commons.tex) - Understand the formalism
3. Check [API.md](API.md) - Know the full API

### For Researchers

1. Start with [commons.tex](commons.tex) - Formal specification
2. Read [general.tex](general.tex) - Broader context
3. Check [README.md](README.md) - Implementation overview
4. Study [API.md](API.md) - How theory maps to code
5. Review [app/Main.hs](app/Main.hs) - Concrete examples

## 🎯 Key Concepts

### The Five Primitives

```
Commons = ⟨G, P, C, w, {Δ_t}⟩
```

- **G** - Graph (relationships)
- **P** - Potentials (capacity/need)
- **C** - Constraints (limits)
- **w** - Weights (preferences)
- **{Δ_t}** - Records (history)

### The Unified Flow Equation

```
Flow(s, r, τ) = min(capacity · w(r)/Σw(r'), need, C(r))
```

Three limiting factors:
1. **Proportional share** - Based on weight
2. **Need bound** - Can't exceed recipient's need
3. **Constraint limit** - Policy-based cap

## 🔧 Module Overview

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `Commons.Types` | Core types | `Potential`, `Graph`, `Commons` |
| `Commons.Potential` | Potential operations | `capacityOf`, `needOf`, `isSource` |
| `Commons.Graph` | Graph operations | `addVertex`, `members`, `types` |
| `Commons.Constraint` | Constraint algebra | `noConstraint`, `capAt`, `(.∧.)` |
| `Commons.Weight` | Weight functions | `needWeight`, `capacityWeight` |
| `Commons.Allocate` | Core allocation | `allocate`, `allocateMultiTier` |
| `Commons.Monad` | Monadic interface | `performAllocationM`, `addVertexM` |

## 💡 Tips

### For Learning

- Start with simple examples in [README.md](README.md)
- Copy patterns from [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Experiment with [app/Main.hs](app/Main.hs)
- Read [API.md](API.md) when you need details

### For Development

- Keep functions pure (except in `CommonsM`)
- Add examples for new features
- Update documentation when changing APIs

### For Research

- Cite [commons.tex](commons.tex) for formal definitions
- Reference [general.tex](general.tex) for broader context
- Use [API.md](API.md) to understand implementation
- Check [app/Main.hs](app/Main.hs) for concrete examples

## 📞 Getting Help

1. **Check the docs** - Most questions are answered here
2. **Look at examples** - See how others solved similar problems
3. **Read the source** - The code is well-documented
4. **Ask questions** - Open an issue on GitHub

## 🎨 Documentation Style

All documentation follows these principles:

1. **Examples first** - Show, don't just tell
2. **Mathematical grounding** - Link to formal definitions
3. **Progressive disclosure** - Simple → Complex
4. **Cross-references** - Link related concepts

## 📝 Contributing to Docs

When updating documentation:

1. Keep examples simple and self-contained
2. Link to related sections
3. Include mathematical definitions where relevant
4. Test all code examples

## 🔗 External Resources

- **Haskell**: https://www.haskell.org/
- **Cabal**: https://www.haskell.org/cabal/
- **Stack**: https://docs.haskellstack.org/

---

**Happy coding! 🚀**

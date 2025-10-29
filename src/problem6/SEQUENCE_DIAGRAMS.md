# Sequence Diagrams - Live Scoreboard System

Detailed flow diagrams for understanding system behavior.

---

## 📊 Flow 1: User Completes Action → Score Update → Broadcast

```
User A             Frontend              Backend           Redis        Database
  │                  │                      │                 │            │
  ├─ Click Button ────────────────────────► │                 │            │
  │ "Complete Quest" │                      │                 │            │
  │                  │                      │                 │            │
  │                  ├─ POST /api/scores/update               │            │
  │                  │ {actionId, actionType, timestamp}      │            │
  │                  │                      │                 │            │
  │                  │                      ├─ Verify JWT token            │
  │                  │                      │                 │            │
  │                  │                      ├─ Check idempotency ◄─────┐   │
  │                  │                      │ (actionId exists?)       │   │
  │                  │                      │                 │        │   │
  │                  │                      ├─ BEGIN TRANSACTION       │   │
  │                  │                      │                 │        │   │
  │                  │                      ├─ INSERT score_history ──┼──► │
  │                  │                      │ (user_id, action_type,   │   │
  │                  │                      │  score_increase=50)      │   │
  │                  │                      │                 │        │   │
  │                  │                      ├─ SELECT SUM(score_increase) ──┐
  │                  │                      │ FROM score_history WHERE... │
  │                  │                      │◄────────────────────────────┘
  │                  │                      │ (new_total_score = 1050) │
  │                  │                      │                 │        │
  │                  │                      ├─ ZADD leaderboard:scores─┤
  │                  │                      │ (user_id: 1050) │        │
  │                  │                      │                 │        │
  │                  │                      ├─ DEL leaderboard:top10 ──┤
  │                  │                      │ (invalidate cache)       │
  │                  │                      │                 │        │
  │                  │                      ├─ COMMIT TRANSACTION      │
  │                  │                      │                 │        │
  │                  │◄──── 200 OK ─────────┤                 │        │
  │                  │ {newScore: 1050,     │                 │        │
  │                  │  scoreIncrease: 50}  │                 │        │
  │                  │                      │                 │        │
  │       Update UI  │                      │                 │        │
  │◄─────────────────┤                      │                 │        │
  │ Show +50 points  │                      │                 │        │
  │ Animation        │                      │                 │        │
  │                  │                      │                 │        │
  │              (WebSocket Broadcast to ALL connected users) │        │
  │                  │                      │                 │        │
  │              ┌───────────────────────────────────────────┐│        │
  │              │ {type: "score_updated",                  ││         │
  │              │  userId: "user-a-uuid",                 ││          │
  │              │  newScore: 1050,                        ││          │
  │              │  scoreIncrease: 50,                     ││          │
  │              │  rank: 7}                               ││          │
  │              └───────────────────────────────────────────┘│        │
  │              /                          │                 │        │
  │             /                           │                 │        │
  └────────────/─────────────────────────────────────────────────────────►
              (Other connected users receive update instantly)
```

**Key Points**:
- Transaction ensures atomicity
- Idempotency prevents double-scoring
- Cache invalidation before WebSocket broadcast
- All connected users see update < 100ms

---

## 📊 Flow 2: Get Top 10 Scores (Cache Hit)

```
User B             Frontend              Backend           Redis        Database
  │                  │                      │                 │            │
  ├─ Load Leaderboard ────────────────────► │                 │            │
  │                  │                      │                 │            │
  │                  ├─ GET /api/scores/top10                 │            │
  │                  │                      │                 │            │
  │                  │                      ├─ Check Redis ────────────────┤
  │                  │                      │ GET leaderboard:top10        │
  │                  │                      │                 │            │
  │                  │                      │         ✓ HIT!  │            │
  │                  │                      │◄────────────────┤            │
  │                  │                      │ {user1: 5000,   │            │
  │                  │                      │  user2: 4950,   │            │
  │                  │                      │  ...}           │            │
  │                  │                      │                 │            │
  │                  │◄──── 200 OK ─────────┤                 │            │
  │                  │ Instant response     │                 │            │
  │       Instant    │                      │                 │            │
  │ Display ◄────────┤                      │                 │            │
  │                  │                      │                 │            │
  │              ┌─────────────────────────────────────────┐  │            │
  │              │ Top 10 Users (From Redis Cache):       ││               │
  │              │ 1. Champion - 5000 pts                 ││               │
  │              │ 2. Player2  - 4950 pts                 ││               │
  │              │ ...                                     │               │
  │              │ 10. TenthPlace - 4500 pts              ││               │
  │              │ Response Time: 5ms ✓                  ││                │
  │              └─────────────────────────────────────────┘│              │
```

**Cache Statistics**:
- Hit rate: ~95% (every 5 minutes expires)
- Miss frequency: ~5% (every 5 min or after invalidation)
- Response time (hit): 5-10ms
- Response time (miss): 50-200ms (DB query + cache)

---

## 📊 Flow 3: Get Top 10 Scores (Cache Miss)

```
User C             Frontend              Backend           Redis        Database
  │                  │                      │                 │            │
  ├─ Load Leaderboard ────────────────────► │                 │            │
  │                  │                      │                 │            │
  │                  ├─ GET /api/scores/top10                 │            │
  │                  │                      │                 │            │
  │                  │                      ├─ Check Redis ────────────────┤
  │                  │                      │ GET leaderboard:top10        │
  │                  │                      │                 │            │
  │                  │                      │       ✗ MISS!  │             │
  │                  │                      │◄─────(nil)──────┤            │
  │                  │                      │                 │            │
  │                  │                      ├─ Calculate top 10 ─────────► │
  │                  │                      │ SELECT ROW_NUMBER(), u.name, │
  │                  │                      │ SUM(s.score_increase) total  │
  │                  │                      │ FROM score_history s         │
  │                  │                      │ ORDER BY total DESC          │
  │                  │                      │ LIMIT 10                     │
  │                  │                      │                 │            │
  │                  │                      │◄────────────────┤            │
  │                  │                      │ Rows: {...}     │            │
  │                  │                      │                 │            │
  │                  │                      ├─ Cache result ───────────────┤
  │                  │                      │ ZADD leaderboard:scores ...  │
  │                  │                      │ EXPIRE 5 minutes             │
  │                  │                      │                 │            │
  │                  │◄──── 200 OK ─────────┤                 │            │
  │                  │ Result from DB       │                 │            │
  │       Display    │                      │                 │            │
  │◄─────────────────┤                      │                 │            │
  │ Response Time:   │                      │                 │            │
  │ ~150ms           │                      │                 │            │
  │ (includes DB)    │                      │                 │            │
```

**Process**:
1. Check Redis cache
2. Cache miss → query database
3. Aggregate score from score_history
4. Cache result for 5 minutes
5. Return to client

---

## 📊 Flow 4: WebSocket Connection & Broadcast

```
User A (Connected)  Backend              Redis         User B (Just Connected)
    │                 │                    │                    │
    │◄─── WS /ws/scoreboard ─────────────► │                    │
    │ (Connection established)             │                    │
    │                 │                    │                    │
    ├─ Send: onConnect event               │                    │
    │◄─── {type: "connected",              │                    │
    │     data: top10}                     │                    │
    │                 │                    │                    │
    │ (Listening...)  │                    │                    │
    │                 │                    │                    │
    │                 │     Score Update from User C            │
    │                 │◄─ POST /api/scores/update ──────────────┤
    │                 │                    │                    │
    │                 ├─ UPDATE Score History               ◄───┤ (waiting)
    │                 ├─ ZADD Redis                             │
    │                 ├─ DEL top10 cache                        │
    │                 │                    │                    │
    │◄────────────────┤ WebSocket Broadcast:                ┌───────────┐
    │ {type: "score_  │ {type: "score_updated",             │ (just     │
    │  updated",      │  userId: "...",                     │ connected)│
    │  rank: 3,       │  newScore: 5100,                    │           │
    │  newScore: 5100}│  scoreIncrease: 50}               ┌─┴───────┐   │
    │                 │                    │              │         │   │
    │ UI Updates      │                    │    Receives same       │   │
    │ Show animation  │                    │◄─── message ───────────┘   │
    │ 3rd place now   │                    │ {type: "score_updated"...} │
    │                 │                    │                    │       │
    │                 │                    │  Gets initial top10│       │
    │                 │    Cache hit on next request ─────────► │       │
    │                 │    GET /api/scores/top10 │              │       │
    │                 │◄─────────────────────────────────────►  │       │
    │                 │         Latest from Redis cache         │       │
    │                 │                    │                  UI shows  │
    │                 │                    │                  latest ✓  │
```

**Broadcast Pattern**:
1. User A connects via WebSocket
2. User C updates score via REST API
3. Backend broadcasts to **all** connected clients (including User A & B)
4. Clients update UI in real-time
5. New connections get latest data from Redis cache

---

## 🔄 Concurrent Users Scenario

```
Timeline:
10:30:00 - User A connects to /ws/scoreboard
10:30:01 - User B connects to /ws/scoreboard
10:30:02 - User C completes quest (+100 points)
          ├─ INSERT into score_history
          ├─ UPDATE Redis sorted set
          ├─ Broadcast message
10:30:02 - User A & B both receive update instantly
10:30:03 - User D makes request GET /api/scores/top10
          ├─ Redis HIT (cache still valid)
          └─ Returns instantly
10:30:05 - User C completes another quest (+50 points)
          ├─ INSERT into score_history
          ├─ UPDATE Redis
          ├─ User A & B see update again
10:30:30 - No new updates, Redis cache still valid
          └─ Future requests serve from cache
```

---

## 🎯 Summary: Why This Design

| Problem | Solution | Benefit |
|---------|----------|---------|
| **Slow calculation** | Score history + aggregation | Append-only (no locks) |
| **1M users query slow** | Redis Sorted Set cache | O(log N) instead of O(N) |
| **Stale data** | WebSocket broadcast | Real-time < 100ms |
| **Manual refresh** | Live updates | User never clicks refresh |
| **Double scoring** | Idempotency check | Safe retries |
| **DB overload** | 95% cache hit rate | 5% DB queries |
| **Concurrent writes** | Append-only score_history | No row contention |

---

## 📚 See Also

- **README.md** - System overview & requirements
- **ARCHITECTURE.md** - Technical deep dive
- **POSTMAN_COLLECTION.json** - Test the APIs

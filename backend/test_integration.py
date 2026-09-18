import asyncio
import httpx
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

async def run_tests():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print(f"[OK] Health Check: {res.json()}")

        # 2. Login
        res = await client.post("/auth/login", json={"email": "rahul@memora.ai", "password": "memora2026"})
        assert res.status_code == 200, f"Login failed: {res.text}"
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Auth Login. User: {res.json()['user']['name']}")

        # 3. List Memories
        res = await client.get("/memories", headers=headers)
        assert res.status_code == 200, f"List memories failed: {res.text}"
        memories = res.json()
        print(f"[OK] GET /memories. Loaded {len(memories)} memories.")

        # 4. Chat: Current Database Query
        res = await client.post("/chat", headers=headers, json={"message": "Which database am I currently using?"})
        assert res.status_code == 200, f"Chat 1 failed: {res.text}"
        data = res.json()
        print(f"[OK] Chat 1 (Current DB): {data['answer'][:60]}...")
        if data.get('evidence'):
            print(f"     Provenance Evidence: {data['evidence'].get('value')} ({data['evidence'].get('status')})")
        assert "PostgreSQL" in data['answer']

        # 5. Chat: Past Database Query
        res = await client.post("/chat", headers=headers, json={"message": "What database did I use before?"})
        assert res.status_code == 200, f"Chat 2 failed: {res.text}"
        data = res.json()
        print(f"[OK] Chat 2 (Past DB): {data['answer'][:60]}...")
        if data.get('evidence'):
            print(f"     Provenance Evidence: {data['evidence'].get('value')} ({data['evidence'].get('status')})")
        assert "MongoDB" in data['answer']

        # 6. Dashboard Stats
        res = await client.get("/dashboard/stats", headers=headers)
        assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
        stats = res.json()
        print(f"[OK] Dashboard Stats: Total={stats['total_memories']}, Active={stats['active_memories']}, Superseded={stats['updated_memories']}")

        # 7. Global Search
        res = await client.get("/search?q=PostgreSQL", headers=headers)
        assert res.status_code == 200, f"Search failed: {res.text}"
        search_res = res.json()
        print(f"[OK] Search: Found {len(search_res['memories'])} memories and {len(search_res['conversations'])} conversations.")

        # 8. Memory Detail
        if memories:
            mem_id = memories[0]["id"]
            res = await client.get(f"/memories/{mem_id}", headers=headers)
            assert res.status_code == 200, f"Detail failed: {res.text}"
            print(f"[OK] Memory Detail for {mem_id}: Status={res.json().get('status')}")

        print("\n*** ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ***")

if __name__ == "__main__":
    asyncio.run(run_tests())

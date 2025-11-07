# Data Migration from SQL to NoSQL with DLoader — Complete Guide

## 1) Introduction to Data Migration

### What is data migration, and why is it important?

**Data migration** is the controlled process of moving data between systems, formats, or storage types. It matters because:

* **Modernization:** moving from legacy relational systems to scalable, flexible datastores.
* **Scalability & performance:** NoSQL handles high write/read throughput and large volumes.
* **Cost & ops:** simpler scaling, commodity hardware, managed services.
* **New features:** document search, flexible schemas, event streaming.

### Key differences: SQL vs NoSQL

| Aspect        | SQL (Relational)                        | NoSQL (Document/Key-Value/Column/Graph)                      |
| ------------- | --------------------------------------- | ------------------------------------------------------------ |
| Schema        | **Rigid** (DDL upfront)                 | **Flexible** (schema-on-read/write)                          |
| Relationships | First-class (JOINs)                     | Modeled via **embedding** or **references**                  |
| Transactions  | Strong ACID                             | Ranges from full ACID (some engines) to eventual consistency |
| Scaling       | Vertical, read replicas                 | Horizontal sharding/partitioning                             |
| Query         | SQL                                     | API/DSL (e.g., JSON queries, key lookups)                    |
| Use cases     | Reporting, OLTP with strict constraints | High throughput, variable data, microservices                |

Implication: migration requires **rethinking data shape** (denormalization, embedding, reference patterns) and **query paths** (design for reads).

---

## 2) Overview of DLoader

### What is DLoader?

**DLoader** is a migration orchestrator that connects to **SQL sources** and **NoSQL targets**, automates **extraction**, **mapping**, **transformation**, **loading**, and **validation** with repeatable, auditable runs.

### Main features & capabilities

* **Connectivity:** JDBC/ODBC for SQL (MySQL, PostgreSQL, SQL Server), native drivers for NoSQL (MongoDB, DynamoDB, etc.).
* **Schema discovery & mapping:** reads SQL schemas, proposes mapping to NoSQL collections/keys/documents.
* **Transform engine:** declarative rules (rename, merge, pivot, denormalize, type cast, JSON build).
* **Workload control:** batching, parallelism, throttling, backoff, checkpointing, resumable runs.
* **Data quality:** constraints checks, referential checks (pre/post), record counts, hash/checksum verification.
* **Observability:** logs, metrics, audit trail, per-batch status, retry queues.
* **Cutover support:** full load + change data capture (CDC) for zero/low downtime.
* **Idempotency:** re-runnable jobs that won’t duplicate data (upserts, natural keys).

---

## 3) Migration Process with DLoader

### High-level steps

1. **Assess & plan**

   * Inventory tables, volumes, growth, SLAs, query patterns.
   * Choose NoSQL target type & **data shapes** (embedding vs referencing).
2. **Model design**

   * Map SQL entities to NoSQL **collections/documents** or **keys**.
   * Define **IDs**, partition/shard keys, indexes.
3. **Set up DLoader connections**

   * Configure source DSN (SQL) and target DSN (NoSQL).
4. **Define mappings & transforms**

   * Declarative rules: field renames, joins → embeddings, type conversions.
5. **Dry run (sample)**

   * Migrate a subset; verify structure, counts, indexes, query performance.
6. **Full load**

   * Bulk export/import with batching and parallelism.
7. **CDC / delta sync (optional)**

   * Apply changes since last checkpoint to keep target fresh.
8. **Cutover**

   * Freeze writes (or keep CDC running), switch applications to NoSQL.
9. **Post-cutover validation**

   * Row/doc counts, checksums, spot audits, business acceptance.
10. **Decommission or archive**

* Archive old system or keep for reporting.

### Common challenges & how to address them

* **Relational to document modeling:** decide **embed vs reference** based on access paths; pre-compute/denormalize frequently joined data.
* **Type mismatches:** define **explicit casting rules** (e.g., DECIMAL → double/string, DATE/TIMESTAMP → ISO 8601).
* **Huge volumes:** use **chunking**, **parallel readers/writers**, and **throttling** to protect both ends.
* **Ordering & dependencies:** migrate parent tables first or **stage and backfill** references.
* **Long downtime:** adopt **CDC** to reduce or eliminate downtime.
* **Validation drift:** build **repeatable validation suites** (counts, referential checks, hash samples).

---

## 4) Data Transformation with DLoader

### How DLoader handles transformation

* **Row → Document:** build JSON documents per row.
* **Join → Embed or Reference:** materialize common child rows into arrays or keep references with foreign keys.
* **Flattening & merging:** collapse normalized tables into nested structures.
* **Type conversion & formatting:** numeric, date/time, enums, booleans.
* **Field rules:** rename, default values, null handling, conditional transforms.
* **Custom hooks:** user functions for complex mapping (e.g., split address → street/city/zip).

### Examples

**SQL source**

```sql
-- customers
id PK, name, email, created_at
-- orders
id PK, customer_id FK(customers.id), status, total_amount, created_at
-- order_items
id PK, order_id FK(orders.id), sku, qty, price
```

**Document embedding (MongoDB target)**
`customers` → `customers` collection; embed most recent N orders (or all if small):

```json
{
  "_id": 123,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-05-01T12:00:00Z",
  "orders": [
    {
      "_id": 9876,
      "status": "PAID",
      "totalAmount": 150.50,
      "createdAt": "2024-06-01T10:00:00Z",
      "items": [
        { "sku": "SKU-1", "qty": 2, "price": 50.00 },
        { "sku": "SKU-2", "qty": 1, "price": 50.50 }
      ]
    }
  ]
}
```

**Referencing (for very large order histories)**

* `customers` and `orders` as separate collections:

  * `orders` documents keep `customerId`.
  * Application queries either fetch by `customerId` or pre-aggregate.

**Typical transforms**

* `TIMESTAMP` → ISO string
* `DECIMAL(12,2)` → number (ensure precision expectations)
* `ENUM('PAID','NEW','CANCELLED')` → string `"PAID"`
* `NULL` emails → omit field or set `null` by policy

---

## 5) Performance Considerations

### Factors to consider

* **Batch size:** large batches reduce overhead; too large increases memory pressure.
* **Parallelism:** readers/writers per table/collection; ensure target can absorb.
* **Indexes:** disable heavy secondary indexes during bulk load, re-build after; keep shard/PK indexes.
* **Network throughput:** colocate workers near databases; use compression when supported.
* **Write patterns:** bulk/ordered vs unordered; upserts vs inserts.
* **Hot partitions:** pick good **partition keys** (high cardinality, uniform distribution).
* **Backpressure & retries:** exponential backoff, idempotent writes.

### How DLoader optimizes

* **Adaptive batching** based on latency/error rate.
* **Parallel pipelines** per entity with concurrency limits.
* **Checkpointing & resume** to avoid re-copying on failure.
* **Streaming extraction** (server-side cursors), **bulk writes** on target.
* **Optional CDC** to shrink cutover window.

---

## 6) Consistency and Integrity

### Ensuring consistency & integrity

* **Pre-checks:** foreign key integrity in source, nullability checks, unique keys.
* **Run isolation:** consistent snapshot (e.g., REPEATABLE READ) for full load or **timestamped cut**.
* **Idempotency:** deterministic IDs, upserts, conflict resolution rules.
* **Transactions (where supported):** group writes logically.

### Verifying accuracy

* **Counts:** table row count vs collection doc count (with filter parity).
* **Checksums:** per-batch hash (e.g., SHA-256 over canonicalized JSON) and aggregate compares.
* **Sampling:** random and stratified samples verified field-by-field.
* **Business invariants:** totals, balances, unique constraints replicated in target logic.
* **Reconciliation reports:** discrepancies with drill-down.

---

## 7) Practical Application — A Simple DLoader Plan

### Scenario

* **Source (SQL):** MySQL with `customers`, `orders`, `order_items`.
* **Target (NoSQL):** MongoDB.

### Design choices

* **Customers:** one document per customer.
* **Orders:** separate collection (large volumes), reference `customerId`.
* **Items:** embedded within orders (bounded, queried together).

### DLoader configuration sketch

**Connections**

```yaml
sources:
  mysql_main:
    type: mysql
    host: ...
    user: ...
    password: ...
    db: salesdb

targets:
  mongo_main:
    type: mongodb
    uri: "mongodb+srv://USER:PASS@CLUSTER/db"
```

**Mappings**

```yaml
mappings:
  - name: customers_to_customers
    source: mysql_main
    target: mongo_main
    read:
      table: customers
      columns: [id, name, email, created_at]
    write:
      collection: customers
      id: id
    transform:
      fields:
        _id: id
        name: name
        email: email
        createdAt: created_at::iso8601

  - name: orders_to_orders
    source: mysql_main
    target: mongo_main
    read:
      table: orders
      columns: [id, customer_id, status, total_amount, created_at]
      join:
        - table: order_items
          on: order_items.order_id = orders.id
    write:
      collection: orders
      id: id
    transform:
      fields:
        _id: id
        customerId: customer_id
        status: status
        totalAmount: total_amount::number
        createdAt: created_at::iso8601
        items: join(order_items)[
          { sku: sku, qty: qty::number, price: price::number }
        ]
```

**Execution**

```bash
# Dry run on 1k rows for each entity
dloader run --job customers_to_customers --limit 1000 --dry-run
dloader run --job orders_to_orders --limit 1000 --dry-run

# Full load with concurrency
dloader run --job customers_to_customers --concurrency 8 --batch-size 5000
dloader run --job orders_to_orders --concurrency 8 --batch-size 2000
```

**Validation**

```yaml
validation:
  - job: customers_count
    source_count: "SELECT COUNT(*) FROM customers"
    target_count: "mongo.collection('customers').countDocuments({})"
  - job: orders_count
    source_count: "SELECT COUNT(*) FROM orders"
    target_count: "mongo.collection('orders').countDocuments({})"
  - job: random_sample_100
    compare:
      sample: 100
      method: "field-by-field"
      key: "id -> _id"
```

**Cutover (optional CDC)**

* Start **CDC** on MySQL (binlog position).
* Run full load → replay CDC deltas until **lag ~ 0** → switch app reads/writes to MongoDB.

### Implementation steps

1. Provision target MongoDB, set shard/indexes (e.g., `orders.customerId`, `orders.createdAt`).
2. Build DLoader configs for connections, mappings, transforms.
3. Run **dry runs** and adjust transforms.
4. Execute **full load** with monitoring and backpressure.
5. Enable **CDC** and reconcile.
6. Cutover, then **freeze** DLoader and archive reports.

---

## 8) Case Studies & Examples

* **E-commerce → MongoDB:** Orders denormalized; embedded line items improved order read latency by 5–10×; background jobs rebuilt secondary indexes post-load.
* **IoT telemetry → Wide-column store:** Moved from relational history tables to time-partitioned columns; write throughput scaled horizontally; queries redesigned around time windows.
* **Payments ledger → Document store with CQRS:** Kept SQL for authoritative ledger; replicated to NoSQL for read models and APIs; migration required robust CDC and reconciliation pipelines.

**Lessons learned**

* Model **for queries**, not just for storage.
* Validate continuously; automate **counts and checksums**.
* Expect to **iterate** on mappings; data realities surface during pilots.
* Separate **full load** and **CDC** concerns; monitor backlog.
* Control **indexes** during bulk load; rebuild after.

---

## 9) Conclusion

**Advantages of migrating to NoSQL**

* Flexible schema for evolving data.
* High horizontal scalability and throughput.
* Natural fit for document-centric APIs and microservices.

**Disadvantages / trade-offs**

* You shoulder relationship management (no JOINs).
* Query language and tooling differ from SQL.
* Strong consistency and multi-document transactions vary by engine.
* Requires careful **data model redesign** and **validation discipline**.

**When to recommend DLoader**

* You need a **repeatable**, **auditable** migration with:

  * Complex transforms (joins → embed/reference).
  * Large data volumes and **parallel bulk** loading.
  * **Checkpointing**, resumability, and **CDC** for low downtime.
  * Built-in **validation** and **observability**.

If your dataset is small and transforms are trivial, a custom script can work. For anything beyond that—multiple tables, denormalization, performance targets—**DLoader** provides the governance, speed, and safety you want.

---

### Quick Checklists

**Pre-migration**

* [ ] Inventory entities, volumes, SLAs, access paths
* [ ] Pick target datastore & design document shapes
* [ ] Define IDs, partition keys, indexes
* [ ] Author DLoader mappings & transforms
* [ ] Pilot on representative sample

**Execution**

* [ ] Run full load with batching & concurrency
* [ ] Monitor throughput, errors, retries
* [ ] Rebuild secondary indexes (if disabled)
* [ ] Enable CDC and reconcile

**Cutover & Post**

* [ ] Freeze writes or run CDC until zero lag
* [ ] Switch traffic to NoSQL
* [ ] Validate counts, checksums, business KPIs
* [ ] Archive reports and decommission legacy (if planned)

---

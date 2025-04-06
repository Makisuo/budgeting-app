
# Financial Transaction Data Project

## Tinybird

### Overview
This project is designed to store and analyze financial transaction data. It captures detailed information about user transactions including amounts, merchants, categories, and status, enabling financial analysis and monitoring.

### Data sources

#### transactions
A datasource storing raw transaction data for financial operations. This includes transaction IDs, user information, amounts, categories, and timestamps for comprehensive financial tracking.

To ingest data into the transactions datasource:

```bash
curl -X POST "https://api.tinybird.co/v0/events?name=transactions" \
    -H "Authorization: Bearer $TB_ADMIN_TOKEN" \
    -d '{
        "transaction_id": "tx_12345",
        "user_id": "user_789",
        "amount": 125.50,
        "currency": "USD",
        "transaction_type": "purchase",
        "status": "completed",
        "merchant": "Acme Store",
        "category": "retail",
        "timestamp": "2023-04-15 14:30:00"
    }'
```

### Endpoints
Currently, no endpoints (Pipes) have been defined for this project. As the project evolves, endpoints will be added to provide API access to transaction data analytics.

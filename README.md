# fere-docs-v4

build command
```
npx -y mint@latest export && unzip -o export.zip -d _site
```

## Regenerate `fere_tools` catalog on `/strategies`

When tools change in `friday/airflow/dags/friday/libs/agents/experimental/v4/tool_registry.py`, refresh the strategies page reference:

```bash
cd friday && PYTHONPATH=. python3.13 scripts/generate_strategy_fere_tools_docs.py
```

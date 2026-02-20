BACKUP_DIR := backups
TIMESTAMP := $(shell date +%Y%m%d_%H%M%S)
API_URL := http://localhost:3001

.PHONY: db-backup db-restore db-export db-import

$(BACKUP_DIR):
	mkdir -p $(BACKUP_DIR)

db-backup: $(BACKUP_DIR)
	docker exec sdos-postgres pg_dump -U sdos sdos | gzip > $(BACKUP_DIR)/backup-$(TIMESTAMP).sql.gz
	@echo "Backup saved to $(BACKUP_DIR)/backup-$(TIMESTAMP).sql.gz"

db-restore: $(BACKUP_DIR)
ifndef FILE
	$(error FILE is required. Usage: make db-restore FILE=backups/backup-xxx.sql.gz)
endif
	gunzip -c $(FILE) | docker exec -i sdos-postgres psql -U sdos sdos
	@echo "Restored from $(FILE)"

db-export: $(BACKUP_DIR)
	curl -sS -H "Authorization: Bearer $${SDOS_TOKEN}" "$(API_URL)/api/admin/export?format=json" -o $(BACKUP_DIR)/export-$(TIMESTAMP).json
	@echo "Export saved to $(BACKUP_DIR)/export-$(TIMESTAMP).json"

db-import: $(BACKUP_DIR)
ifndef FILE
	$(error FILE is required. Usage: make db-import FILE=backups/export.json)
endif
	curl -sS -X POST -H "Authorization: Bearer $${SDOS_TOKEN}" -H "Content-Type: application/json" -d @$(FILE) "$(API_URL)/api/admin/import"
	@echo "Imported from $(FILE)"

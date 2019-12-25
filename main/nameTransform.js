function formatDatabaseTypeName(databaseType) {
    return {
        "POSTGRESQL": "PostgreSQL",
        "MYSQL": "MySQL",
        "MARIADB": "MariaDB"
    }[databaseType]
}

function appTypeToAppTypeName(databaseType) {
    return {
        "NODEJS": "Node.js",
    }[databaseType]
}

function appTypeNameToAppType(databaseType) {
    return {
        "Node.js": "NODEJS",
    }[databaseType]
}

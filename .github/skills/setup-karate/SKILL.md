---
name: setup-karate
description: Crea el proyecto Karate Framework desde cero usando el archetype oficial de Karate (io.karatelabs:karate-archetype). Configura Java 17. Idempotente — no recrea si ya existe. Versión standalone independiente de ASDD.
argument-hint: "[--base-url <url>] [--env dev|staging|prod]"
---

# Setup Karate (Standalone)

Crea un proyecto Karate Framework completo y funcional desde cero usando el archetype oficial de Karate. Si el proyecto ya existe (`pom.xml`), reporta que ya está creado y no sobrescribe.

## Proceso

1. **Verificar si el proyecto existe**: ¿Existe `pom.xml` en la raíz?
   - SÍ → Reportar `"Proyecto Karate ya existe. Para regenerar, elimina pom.xml"`
   - NO → Continuar

2. **Ejecutar el archetype oficial de Karate**:
   ```bash
   mvn archetype:generate \
     -DarchetypeGroupId=io.karatelabs \
     -DarchetypeArtifactId=karate-archetype \
     -DarchetypeVersion=1.5.0 \
     -DgroupId=com.karateproject \
     -DartifactId=karate-project \
     -DinteractiveMode=false
   ```
   - Esto genera automáticamente toda la estructura oficial de Karate
   - Incluye: `pom.xml`, `karate-config.js`, runners, `logback-test.xml`, carpetas estándar

3. **Ajustar la versión de Java**: Cambiar de Java 11 a Java 17
   - Abrir `pom.xml`
   - Buscar: `<java.version>11</java.version>`
   - Reemplazar por: `<java.version>17</java.version>`
   - Guardar

4. **Verificación final**: Lista los archivos generados
   ```
   ✓ pom.xml
   ✓ src/test/java/karate-config.js
   ✓ src/test/java/logback-test.xml
   ✓ src/test/java/KarateRunnerTest.java
   ✓ src/test/java/examples/ (ejemplos básicos)
   ```

## Output generado por el archetype

```
karate-project/
├── pom.xml                         ← Maven con karate-junit5 1.5.0 + JUnit 5 (cambiar Java a 17)
├── README.md
├── .gitignore
└── src/
    └── test/
        └── java/
            ├── karate-config.js              ← Configuración multi-entorno (actualizar baseUrl)
            ├── logback-test.xml              ← Configuración de logs (Logback + SLF4J)
            ├── AmazonRunnerTest.java         ← Ejemplo runner (renombrar o eliminar)
            ├── examples/
            │   ├── ExampleRunner.java
            │   ├── example.feature
            │   ├── products.feature
            │   ├── users.feature
            │   └── data/
            │       └── sample.json
            └── (agregar más runners y features aquí)
```

**Post-generación — acciones manuales:**
1. ✅ Cambiar Java version de 11 → **17** en `pom.xml`
2. Eliminar los ejemplos en `src/test/java/examples/` si no se necesitan
3. Actualizar `karate-config.js` con la URL correcta de la API

## Reglas

- **Idempotente**: si `pom.xml` existe, NO sobrescribir — solo reportar.
- **Archetype oficial**: usar el archetype de Karate (`io.karatelabs:karate-archetype:1.5.0`)
- **Java 17**: cambiar OBLIGATORIAMENTE la versión de Java del pom.xml generado de 11 → 17
- **No hardcodear URLs**: toda URL va en `karate-config.js` según el entorno
- **No hardcodear credenciales**: usar `java.lang.System.getenv()` en `karate-config.js`
- **UTF-8**: encoding del proyecto (incluido en el archetype)
- Si el usuario proporciona `--base-url`, usarla en la configuración dev de `karate-config.js`

## Resultado esperado

Tras ejecutar este skill:
- Proyecto Karate completo y funcional
- Java 17 configurado correctamente
- Ready para ejecutar: `mvn clean test`
- Reports generarse en: `target/site/surefire-report.html`
- Logs disponibles en: `target/karate.log`

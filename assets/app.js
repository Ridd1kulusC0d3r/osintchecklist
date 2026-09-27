const STORAGE_KEY = "osintChecklistCaseV1";
const LANG_KEY = "osintChecklistLanguageV1";
const SCHEMA = "osintchecklist.case.v3";
const APP_VERSION = "0.3.0";

let baseModel = null;
let model = null;
const translationCache = {};
let currentLang = detectLanguage();
let activeTab = "checklist";

const EMPTY_STATE = () => ({
  schemaVersion: 3,
  meta: {
    caseRef: "",
    profile: "all",
    objective: "",
    scope: "",
    urgency: "normal",
    analyst: "",
    context: ""
  },
  tasks: {},
  evidence: [],
  entities: [],
  relationships: [],
  timeline: [],
  findings: [],
  logbook: [],
  uiMode: "full"
});

let state = EMPTY_STATE();

const I18N = {
  "pt-BR": {
    modes:{quick:"Diário de bordo",full:"Workbench completo"},
    modeHintQuick:"Modo rápido: marque ações executadas e o sistema registra o histórico automaticamente. Use notas rápidas quando precisar.",
    modeHintFull:"Modo completo: checklist + evidências + entidades + relações + timeline + achados.",
    stages:{direction:"1 · Direção",collection:"2 · Coleta",synthesis:"3 · Corroboração e síntese",decision:"4 · Análise e decisão",closure:"5 · Entrega e aprendizado"},
    logbookHeading:"Diário de bordo",logbookIntro:"Histórico cronológico das ações registradas no caso. Mudanças no checklist entram automaticamente.",
    logbookNote:"Nota rápida",logbookNotePh:"Registre uma observação geral sem precisar abrir cada item do checklist.",addLogbookNote:"Adicionar nota",exportLogbook:"Exportar diário",
    logbookEmpty:"Nenhuma atividade registrada.",logActions:{task:"Checklist",note:"Nota",evidence:"Evidência",entity:"Entidade",relationship:"Relação",timeline:"Timeline",finding:"Achado"},

    subtitle:"Workbench local-first para conduzir, documentar, correlacionar e revisar investigações OSINT.",
    language:"Idioma", privacyTitle:"Os dados do caso ficam neste navegador até você exportá-los.",
    caseKicker:"CONTROLE DO CASO", case:"Caso", reset:"Limpar", caseRef:"Referência do caso",
    profile:"Perfil de investigação", objective:"Objetivo / requisito de inteligência",
    objectivePh:"Qual pergunta precisa ser respondida e qual decisão será apoiada?",
    scope:"Escopo", scopePh:"Período, região, fontes permitidas, limites e critérios de encerramento.",
    urgency:"Urgência", analyst:"Analista", analystPh:"Alias ou equipe", context:"Contexto resumido",
    contextPh:"Registre somente o necessário. Prefira aliases e referências internas.",
    privacyNotice:"<strong>Minimização por padrão.</strong> Evite PII desnecessária, credenciais, segredos ou dados sem autorização de tratamento.",
    progressKicker:"SAÚDE DO CASO", progress:"Progresso", applicable:"aplicáveis",
    bundleKicker:"PACOTE DO CASO", export:"Exportar & backup", exportBundle:"Exportar pacote do caso",
    importBundle:"Importar pacote do caso", exportMd:"Exportar relatório Markdown", print:"Imprimir / salvar PDF",
    insights:"Insights de processo", exportHint:"O pacote JSON contém checklist e registros do workbench. Guarde-o como dado de caso.",
    tabs:{checklist:"Checklist",evidence:"Evidências",entities:"Entidades & relações",timeline:"Timeline",findings:"Achados",logbook:"Diário"},
    checklist:"Checklist", searchPh:"Filtrar tarefas...", core:"NÚCLEO", contextual:"CONTEXTUAL",
    legendCore:"Etapa núcleo", legendContext:"Etapa contextual", legendCaveat:"✓ executar ≠ confirmar hipótese",
    status:{all:"Todos os status",todo:"Não iniciado",doing:"Em andamento",done:"Concluído",na:"Não aplicável"},
    profiles:{all:"OSINT geral",person:"Pessoa / entidade",organization:"Organização",cyber:"Cyber / infraestrutura",fraud:"Fraude / golpe",media:"Verificação de mídia"},
    urgencies:{normal:"Normal",high:"Alta",critical:"Crítica"}, completed:"concluídos",
    note:"Observação / achado", notePh:"Registre fato observado, resultado negativo, limitação ou conclusão intermediária.",
    source:"Fonte / evidência", sourcePh:"URL, evidence ID, documento ou referência interna", addEvidence:"+ Evidência",
    emptyFilter:"Nenhuma tarefa corresponde aos filtros atuais.", markDone:"Marcar como concluído",
    evidenceHeading:"Evidências", evidenceIntro:"Registre a origem, o momento da observação, a qualidade da fonte e a referência de integridade.",
    evidenceButton:"+ Evidência", title:"Título", sourceType:"Tipo de fonte", observedAt:"Observado em",
    sourceRef:"URL / referência da fonte", reliability:"Confiabilidade da fonte", credibility:"Credibilidade da informação",
    checklistTask:"Tarefa do checklist", hash:"Hash / referência de integridade", notes:"Notas", saveEvidence:"Salvar evidência",
    cancel:"Cancelar", sourceScale:"Escala opcional: A–F avalia a confiabilidade da fonte; 1–6 avalia a credibilidade da informação. Use 'não avaliado' quando não houver base suficiente.",
    evidenceSearchPh:"Filtrar evidências...", evidenceEmpty:"Nenhuma evidência registrada.", edit:"Editar", remove:"Excluir",
    sourceTypes:{web:"Página web",social:"Rede social",official:"Registro/fonte oficial",document:"Documento",media:"Imagem/vídeo",technical:"Fonte técnica",archive:"Arquivo/web archive",other:"Outro"},
    reliabilities:{NA:"Não avaliado",A:"A · Confiável",B:"B · Geralmente confiável",C:"C · Moderadamente confiável",D:"D · Geralmente não confiável",E:"E · Não confiável",F:"F · Não avaliável"},
    credibilities:{NA:"Não avaliado","1":"1 · Confirmada","2":"2 · Provavelmente verdadeira","3":"3 · Possivelmente verdadeira","4":"4 · Duvidosa","5":"5 · Improvável","6":"6 · Não avaliável"},
    entitiesHeading:"Entidades & relações", entitiesIntro:"Modele objetos do caso e declare explicitamente o tipo de relação. Proximidade no grafo não é causalidade.",
    entityRegister:"Entidades", entityButton:"+ Entidade", entityLabel:"Rótulo", entityType:"Tipo", aliases:"Aliases / identificadores conhecidos",
    saveEntity:"Salvar entidade", entityEmpty:"Nenhuma entidade registrada.",
    entityTypes:{person:"Pessoa",organization:"Organização",account:"Conta/perfil",domain:"Domínio",email:"E-mail",phone:"Telefone",location:"Local",asset:"Ativo",event:"Evento",other:"Outro"},
    relationships:"Relações", relationshipButton:"+ Relação", from:"De", relationType:"Tipo de relação", to:"Para",
    confidence:"Confiança", evidenceIds:"Evidence IDs", saveRelationship:"Salvar relação", relationshipEmpty:"Nenhuma relação registrada.",
    confidences:{na:"Não avaliada",low:"Baixa",moderate:"Moderada",high:"Alta"},
    timelineHeading:"Timeline", timelineIntro:"Organize eventos com data, entidades e evidências sem transformar proximidade temporal em causalidade.",
    eventButton:"+ Evento", dateTime:"Data / hora", eventTitle:"Título do evento", entityIds:"Entity IDs", description:"Descrição",
    saveEvent:"Salvar evento", timelineEmpty:"Nenhum evento registrado.",
    findingsHeading:"Achados", findingsIntro:"Registre observações, julgamentos e lacunas. Julgamentos devem apontar para evidências e incerteza.",
    findingButton:"+ Achado", findingType:"Tipo", statement:"Declaração", alternative:"Explicação alternativa", caveat:"Ressalva / lacuna de informação",
    saveFinding:"Salvar achado", findingEmpty:"Nenhum achado analítico registrado.",
    findingTypes:{observation:"Observação",judgment:"Julgamento analítico",gap:"Lacuna de inteligência"},
    stats:{checklist:"Checklist",evidence:"Evidências",entities:"Entidades",timeline:"Eventos",findings:"Achados"},
    noTask:"Sem vínculo com checklist", noSource:"Sem referência", noDate:"Sem data", noEvidence:"Sem evidência vinculada",
    confirmDelete:"Excluir este registro? Esta ação não pode ser desfeita.", resetConfirm:"Limpar todos os dados locais deste caso?",
    imported:"Pacote do caso importado.", importInvalid:"Arquivo de caso inválido ou incompatível.", importConfirm:"Importar este pacote substituirá o caso aberto neste navegador. Continuar?",
    popupBlocked:"O navegador bloqueou a janela do relatório. Permita pop-ups para usar impressão/PDF.",
    insightsHeading:"Insights de processo", close:"Fechar", footer:"Checklist e workbench não substituem julgamento analítico, revisão legal ou validação de evidências.",
    process:{
      openCore:"Etapas núcleo ainda abertas",openCoreD:"Lacunas procedimentais antes do encerramento.",
      undocumented:"Checklist concluído sem documentação",undocumentedD:"Itens concluídos sem observação nem referência.",
      evidenceMissing:"Evidências sem referência de origem",evidenceMissingD:"Registros de evidência sem URL ou referência de fonte.",
      relationsMissing:"Relações sem evidência",relationsMissingD:"Relações registradas sem evidence IDs.",
      findingsMissing:"Julgamentos sem evidência",findingsMissingD:"Julgamentos analíticos que não apontam para evidência.",
      highWeak:"Alta confiança com pouca sustentação",highWeakD:"Achados com confiança alta e menos de duas referências de evidência. É um alerta de processo, não uma regra de verdade.",
      brokenRefs:"Referências inexistentes",brokenRefsD:"IDs citados em relações, timeline ou achados que não existem no caso.",
      none:"Nenhum item detectado."
    },
    report:{
      title:"Relatório de Investigação OSINT",generated:"Gerado em",executive:"Resumo executivo",case:"Caso",analyst:"Analista/equipe",
      profile:"Perfil",urgency:"Urgência",objective:"Requisito de inteligência",scope:"Escopo",context:"Contexto",
      coverage:"Cobertura do caso",evidence:"Registro de evidências",entities:"Entidades",relationships:"Relações",
      timeline:"Timeline",findings:"Achados analíticos",openCore:"Etapas núcleo abertas",method:"Ressalva metodológica",
      methodText:"Conclusões e relações devem permanecer rastreáveis às evidências e à incerteza declarada. Marcar uma tarefa como concluída registra execução do procedimento, não confirmação automática de identidade, atribuição, hipótese ou alegação.",
      notProvided:"Não informado",none:"Nenhum registro.",print:"Imprimir / Salvar como PDF"
    }
  },
  en: {
    modes:{quick:"Quick log",full:"Full workbench"},
    modeHintQuick:"Fast mode: mark completed actions and the system automatically records the activity trail. Add quick notes only when needed.",
    modeHintFull:"Full mode: checklist + evidence + entities + relationships + timeline + findings.",
    stages:{direction:"1 · Direction",collection:"2 · Collection",synthesis:"3 · Corroboration & synthesis",decision:"4 · Analysis & decision",closure:"5 · Delivery & learning"},
    logbookHeading:"Logbook",logbookIntro:"Chronological history of case activity. Checklist state changes are recorded automatically.",
    logbookNote:"Quick note",logbookNotePh:"Record a general observation without opening every checklist item.",addLogbookNote:"Add note",exportLogbook:"Export logbook",
    logbookEmpty:"No activity recorded.",logActions:{task:"Checklist",note:"Note",evidence:"Evidence",entity:"Entity",relationship:"Relationship",timeline:"Timeline",finding:"Finding"},

    subtitle:"A local-first workbench to conduct, document, correlate and review OSINT investigations.",
    language:"Language", privacyTitle:"Case data stays in this browser until you export it.",
    caseKicker:"CASE CONTROL", case:"Case", reset:"Reset", caseRef:"Case reference",
    profile:"Investigation profile", objective:"Objective / intelligence requirement",
    objectivePh:"What question must be answered and what decision will it support?",
    scope:"Scope", scopePh:"Time period, region, permitted sources, limits and stop conditions.",
    urgency:"Urgency", analyst:"Analyst", analystPh:"Alias or team", context:"Context summary",
    contextPh:"Record only what is necessary. Prefer aliases and internal references.",
    privacyNotice:"<strong>Minimization by default.</strong> Avoid unnecessary personal data, credentials, secrets or data you are not authorized to process.",
    progressKicker:"CASE HEALTH", progress:"Progress", applicable:"applicable",
    bundleKicker:"CASE BUNDLE", export:"Export & backup", exportBundle:"Export case bundle",
    importBundle:"Import case bundle", exportMd:"Export Markdown report", print:"Print / save PDF",
    insights:"Process insights", exportHint:"The JSON bundle contains checklist and workbench records. Treat it as case data.",
    tabs:{checklist:"Checklist",evidence:"Evidence",entities:"Entities & relationships",timeline:"Timeline",findings:"Findings",logbook:"Logbook"},
    checklist:"Checklist", searchPh:"Filter tasks...", core:"CORE", contextual:"CONTEXTUAL",
    legendCore:"Core step", legendContext:"Contextual step", legendCaveat:"✓ performed ≠ hypothesis confirmed",
    status:{all:"All statuses",todo:"Not started",doing:"In progress",done:"Completed",na:"Not applicable"},
    profiles:{all:"General OSINT",person:"Person / entity",organization:"Organization",cyber:"Cyber / infrastructure",fraud:"Fraud / scam",media:"Media verification"},
    urgencies:{normal:"Normal",high:"High",critical:"Critical"}, completed:"completed",
    note:"Observation / finding", notePh:"Record an observed fact, negative result, limitation or intermediate conclusion.",
    source:"Source / evidence", sourcePh:"URL, evidence ID, document or internal reference", addEvidence:"+ Evidence",
    emptyFilter:"No tasks match the current filters.", markDone:"Mark completed",
    evidenceHeading:"Evidence", evidenceIntro:"Record origin, observation time, source quality and integrity reference.",
    evidenceButton:"+ Evidence", title:"Title", sourceType:"Source type", observedAt:"Observed at",
    sourceRef:"URL / source reference", reliability:"Source reliability", credibility:"Information credibility",
    checklistTask:"Checklist task", hash:"Hash / integrity reference", notes:"Notes", saveEvidence:"Save evidence",
    cancel:"Cancel", sourceScale:"Optional scale: A–F assesses source reliability; 1–6 assesses information credibility. Use 'not assessed' when there is insufficient basis.",
    evidenceSearchPh:"Filter evidence...", evidenceEmpty:"No evidence recorded.", edit:"Edit", remove:"Delete",
    sourceTypes:{web:"Web page",social:"Social media",official:"Official record/source",document:"Document",media:"Image/video",technical:"Technical source",archive:"Archive/web archive",other:"Other"},
    reliabilities:{NA:"Not assessed",A:"A · Reliable",B:"B · Usually reliable",C:"C · Fairly reliable",D:"D · Not usually reliable",E:"E · Unreliable",F:"F · Cannot be judged"},
    credibilities:{NA:"Not assessed","1":"1 · Confirmed","2":"2 · Probably true","3":"3 · Possibly true","4":"4 · Doubtful","5":"5 · Improbable","6":"6 · Cannot be judged"},
    entitiesHeading:"Entities & relationships", entitiesIntro:"Model case objects and explicitly name relationship types. Graph proximity is not causality.",
    entityRegister:"Entities", entityButton:"+ Entity", entityLabel:"Label", entityType:"Type", aliases:"Aliases / known identifiers",
    saveEntity:"Save entity", entityEmpty:"No entities recorded.",
    entityTypes:{person:"Person",organization:"Organization",account:"Account/profile",domain:"Domain",email:"Email",phone:"Phone",location:"Location",asset:"Asset",event:"Event",other:"Other"},
    relationships:"Relationships", relationshipButton:"+ Relationship", from:"From", relationType:"Relationship type", to:"To",
    confidence:"Confidence", evidenceIds:"Evidence IDs", saveRelationship:"Save relationship", relationshipEmpty:"No relationships recorded.",
    confidences:{na:"Not assessed",low:"Low",moderate:"Moderate",high:"High"},
    timelineHeading:"Timeline", timelineIntro:"Organize events with dates, entities and evidence without turning temporal proximity into causality.",
    eventButton:"+ Event", dateTime:"Date / time", eventTitle:"Event title", entityIds:"Entity IDs", description:"Description",
    saveEvent:"Save event", timelineEmpty:"No events recorded.",
    findingsHeading:"Findings", findingsIntro:"Record observations, judgments and gaps. Judgments should point to evidence and uncertainty.",
    findingButton:"+ Finding", findingType:"Type", statement:"Statement", alternative:"Alternative explanation", caveat:"Caveat / information gap",
    saveFinding:"Save finding", findingEmpty:"No analytic findings recorded.",
    findingTypes:{observation:"Observation",judgment:"Analytic judgment",gap:"Intelligence gap"},
    stats:{checklist:"Checklist",evidence:"Evidence",entities:"Entities",timeline:"Events",findings:"Findings"},
    noTask:"No checklist link", noSource:"No source reference", noDate:"No date", noEvidence:"No linked evidence",
    confirmDelete:"Delete this record? This cannot be undone.", resetConfirm:"Clear all local data for this case?",
    imported:"Case bundle imported.", importInvalid:"Invalid or incompatible case file.", importConfirm:"Importing this bundle will replace the open case in this browser. Continue?",
    popupBlocked:"The browser blocked the report window. Allow pop-ups to use print/PDF.",
    insightsHeading:"Process insights", close:"Close", footer:"The checklist and workbench do not replace analytic judgment, legal review or evidence validation.",
    process:{
      openCore:"Core steps still open",openCoreD:"Procedural gaps before case closure.",
      undocumented:"Checklist completed without documentation",undocumentedD:"Completed items with neither observation nor reference.",
      evidenceMissing:"Evidence without origin reference",evidenceMissingD:"Evidence records with no URL or source reference.",
      relationsMissing:"Relationships without evidence",relationsMissingD:"Relationships recorded without evidence IDs.",
      findingsMissing:"Judgments without evidence",findingsMissingD:"Analytic judgments that do not point to evidence.",
      highWeak:"High confidence with thin support",highWeakD:"High-confidence findings with fewer than two evidence references. This is a process flag, not a truth rule.",
      brokenRefs:"Broken references",brokenRefsD:"IDs cited in relationships, timeline or findings that do not exist in the case.",
      none:"No items detected."
    },
    report:{
      title:"OSINT Investigation Report",generated:"Generated",executive:"Executive summary",case:"Case",analyst:"Analyst/team",
      profile:"Profile",urgency:"Urgency",objective:"Intelligence requirement",scope:"Scope",context:"Context",
      coverage:"Case coverage",evidence:"Evidence register",entities:"Entities",relationships:"Relationships",
      timeline:"Timeline",findings:"Analytic findings",openCore:"Open core steps",method:"Methodological caveat",
      methodText:"Conclusions and relationships should remain traceable to evidence and stated uncertainty. Marking a task completed records procedure execution, not automatic confirmation of identity, attribution, hypothesis or allegation.",
      notProvided:"Not provided",none:"No records.",print:"Print / Save as PDF"
    }
  },
  es: {
    modes:{quick:"Diario de bordo",full:"Workbench completo"},
    modeHintQuick:"Modo rápido: marque acciones ejecutadas y el sistema registra automáticamente el historial. Añada notas rápidas solo cuando sea necesario.",
    modeHintFull:"Modo completo: checklist + evidencias + entidades + relaciones + timeline + hallazgos.",
    stages:{direction:"1 · Dirección",collection:"2 · Recolección",synthesis:"3 · Corroboración y síntesis",decision:"4 · Análisis y decisión",closure:"5 · Entrega y aprendizaje"},
    logbookHeading:"Diario de bordo",logbookIntro:"Historial cronológico de la actividad del caso. Los cambios del checklist se registran automáticamente.",
    logbookNote:"Nota rápida",logbookNotePh:"Registre una observación general sin abrir cada elemento del checklist.",addLogbookNote:"Añadir nota",exportLogbook:"Exportar diario",
    logbookEmpty:"No hay actividad registrada.",logActions:{task:"Checklist",note:"Nota",evidence:"Evidencia",entity:"Entidad",relationship:"Relación",timeline:"Timeline",finding:"Hallazgo"},

    subtitle:"Workbench local-first para conducir, documentar, correlacionar y revisar investigaciones OSINT.",
    language:"Idioma", privacyTitle:"Los datos del caso permanecen en este navegador hasta que los exporte.",
    caseKicker:"CONTROL DEL CASO", case:"Caso", reset:"Limpiar", caseRef:"Referencia del caso",
    profile:"Perfil de investigación", objective:"Objetivo / requisito de inteligencia",
    objectivePh:"¿Qué pregunta debe responderse y qué decisión apoyará?",
    scope:"Alcance", scopePh:"Período, región, fuentes permitidas, límites y criterios de cierre.",
    urgency:"Urgencia", analyst:"Analista", analystPh:"Alias o equipo", context:"Resumen del contexto",
    contextPh:"Registre solo lo necesario. Prefiera alias y referencias internas.",
    privacyNotice:"<strong>Minimización por defecto.</strong> Evite datos personales innecesarios, credenciales, secretos o datos sin autorización de tratamiento.",
    progressKicker:"SALUD DEL CASO", progress:"Progreso", applicable:"aplicables",
    bundleKicker:"PAQUETE DEL CASO", export:"Exportar & backup", exportBundle:"Exportar paquete del caso",
    importBundle:"Importar paquete del caso", exportMd:"Exportar informe Markdown", print:"Imprimir / guardar PDF",
    insights:"Insights del proceso", exportHint:"El paquete JSON contiene el checklist y los registros del workbench. Trátelo como dato del caso.",
    tabs:{checklist:"Checklist",evidence:"Evidencias",entities:"Entidades & relaciones",timeline:"Timeline",findings:"Hallazgos",logbook:"Diario"},
    checklist:"Checklist", searchPh:"Filtrar tareas...", core:"NÚCLEO", contextual:"CONTEXTUAL",
    legendCore:"Etapa núcleo", legendContext:"Etapa contextual", legendCaveat:"✓ ejecutar ≠ confirmar hipótesis",
    status:{all:"Todos los estados",todo:"No iniciado",doing:"En curso",done:"Completado",na:"No aplicable"},
    profiles:{all:"OSINT general",person:"Persona / entidad",organization:"Organización",cyber:"Cyber / infraestructura",fraud:"Fraude / estafa",media:"Verificación de medios"},
    urgencies:{normal:"Normal",high:"Alta",critical:"Crítica"}, completed:"completados",
    note:"Observación / hallazgo", notePh:"Registre un hecho observado, resultado negativo, limitación o conclusión intermedia.",
    source:"Fuente / evidencia", sourcePh:"URL, evidence ID, documento o referencia interna", addEvidence:"+ Evidencia",
    emptyFilter:"Ninguna tarea coincide con los filtros actuales.", markDone:"Marcar como completado",
    evidenceHeading:"Evidencias", evidenceIntro:"Registre origen, momento de observación, calidad de la fuente y referencia de integridad.",
    evidenceButton:"+ Evidencia", title:"Título", sourceType:"Tipo de fuente", observedAt:"Observado en",
    sourceRef:"URL / referencia de la fuente", reliability:"Confiabilidad de la fuente", credibility:"Credibilidad de la información",
    checklistTask:"Tarea del checklist", hash:"Hash / referencia de integridad", notes:"Notas", saveEvidence:"Guardar evidencia",
    cancel:"Cancelar", sourceScale:"Escala opcional: A–F evalúa la confiabilidad de la fuente; 1–6 evalúa la credibilidad de la información. Use 'no evaluado' cuando no exista base suficiente.",
    evidenceSearchPh:"Filtrar evidencias...", evidenceEmpty:"No hay evidencias registradas.", edit:"Editar", remove:"Eliminar",
    sourceTypes:{web:"Página web",social:"Red social",official:"Registro/fuente oficial",document:"Documento",media:"Imagen/vídeo",technical:"Fuente técnica",archive:"Archivo/web archive",other:"Otro"},
    reliabilities:{NA:"No evaluado",A:"A · Confiable",B:"B · Generalmente confiable",C:"C · Moderadamente confiable",D:"D · Generalmente no confiable",E:"E · No confiable",F:"F · No evaluable"},
    credibilities:{NA:"No evaluado","1":"1 · Confirmada","2":"2 · Probablemente verdadera","3":"3 · Posiblemente verdadera","4":"4 · Dudosa","5":"5 · Improbable","6":"6 · No evaluable"},
    entitiesHeading:"Entidades & relaciones", entitiesIntro:"Modele objetos del caso y declare explícitamente el tipo de relación. La proximidad en el grafo no es causalidad.",
    entityRegister:"Entidades", entityButton:"+ Entidad", entityLabel:"Etiqueta", entityType:"Tipo", aliases:"Alias / identificadores conocidos",
    saveEntity:"Guardar entidad", entityEmpty:"No hay entidades registradas.",
    entityTypes:{person:"Persona",organization:"Organización",account:"Cuenta/perfil",domain:"Dominio",email:"Correo",phone:"Teléfono",location:"Lugar",asset:"Activo",event:"Evento",other:"Otro"},
    relationships:"Relaciones", relationshipButton:"+ Relación", from:"De", relationType:"Tipo de relación", to:"Para",
    confidence:"Confianza", evidenceIds:"Evidence IDs", saveRelationship:"Guardar relación", relationshipEmpty:"No hay relaciones registradas.",
    confidences:{na:"No evaluada",low:"Baja",moderate:"Moderada",high:"Alta"},
    timelineHeading:"Timeline", timelineIntro:"Organice eventos con fecha, entidades y evidencias sin convertir proximidad temporal en causalidad.",
    eventButton:"+ Evento", dateTime:"Fecha / hora", eventTitle:"Título del evento", entityIds:"Entity IDs", description:"Descripción",
    saveEvent:"Guardar evento", timelineEmpty:"No hay eventos registrados.",
    findingsHeading:"Hallazgos", findingsIntro:"Registre observaciones, juicios y brechas. Los juicios deben apuntar a evidencia e incertidumbre.",
    findingButton:"+ Hallazgo", findingType:"Tipo", statement:"Declaración", alternative:"Explicación alternativa", caveat:"Salvedad / brecha de información",
    saveFinding:"Guardar hallazgo", findingEmpty:"No hay hallazgos analíticos registrados.",
    findingTypes:{observation:"Observación",judgment:"Juicio analítico",gap:"Brecha de inteligencia"},
    stats:{checklist:"Checklist",evidence:"Evidencias",entities:"Entidades",timeline:"Eventos",findings:"Hallazgos"},
    noTask:"Sin vínculo con checklist", noSource:"Sin referencia", noDate:"Sin fecha", noEvidence:"Sin evidencia vinculada",
    confirmDelete:"¿Eliminar este registro? Esta acción no se puede deshacer.", resetConfirm:"¿Limpiar todos los datos locales de este caso?",
    imported:"Paquete del caso importado.", importInvalid:"Archivo de caso inválido o incompatible.", importConfirm:"Importar este paquete reemplazará el caso abierto en este navegador. ¿Continuar?",
    popupBlocked:"El navegador bloqueó la ventana del informe. Permita pop-ups para usar impresión/PDF.",
    insightsHeading:"Insights del proceso", close:"Cerrar", footer:"El checklist y el workbench no sustituyen el juicio analítico, la revisión legal ni la validación de evidencias.",
    process:{
      openCore:"Etapas núcleo aún abiertas",openCoreD:"Brechas procedimentales antes del cierre.",
      undocumented:"Checklist completado sin documentación",undocumentedD:"Elementos completados sin observación ni referencia.",
      evidenceMissing:"Evidencias sin referencia de origen",evidenceMissingD:"Registros de evidencia sin URL o referencia de fuente.",
      relationsMissing:"Relaciones sin evidencia",relationsMissingD:"Relaciones registradas sin evidence IDs.",
      findingsMissing:"Juicios sin evidencia",findingsMissingD:"Juicios analíticos que no apuntan a evidencia.",
      highWeak:"Alta confianza con poco sustento",highWeakD:"Hallazgos de alta confianza con menos de dos referencias de evidencia. Es una alerta de proceso, no una regla de verdad.",
      brokenRefs:"Referencias inexistentes",brokenRefsD:"IDs citados en relaciones, timeline o hallazgos que no existen en el caso.",
      none:"No se detectaron elementos."
    },
    report:{
      title:"Informe de Investigación OSINT",generated:"Generado",executive:"Resumen ejecutivo",case:"Caso",analyst:"Analista/equipo",
      profile:"Perfil",urgency:"Urgencia",objective:"Requisito de inteligencia",scope:"Alcance",context:"Contexto",
      coverage:"Cobertura del caso",evidence:"Registro de evidencias",entities:"Entidades",relationships:"Relaciones",
      timeline:"Timeline",findings:"Hallazgos analíticos",openCore:"Etapas núcleo abiertas",method:"Salvedad metodológica",
      methodText:"Las conclusiones y relaciones deben permanecer trazables a evidencias y a la incertidumbre declarada. Marcar una tarea como completada registra la ejecución del procedimiento, no la confirmación automática de identidad, atribución, hipótesis o alegación.",
      notProvided:"No informado",none:"Sin registros.",print:"Imprimir / Guardar como PDF"
    }
  }
};

const $ = id => document.getElementById(id);
const tx = () => I18N[currentLang];

function escapeHtml(value=""){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function detectLanguage(){
  const supported=["pt-BR","en","es"];
  const saved=localStorage.getItem(LANG_KEY);
  if(saved && supported.includes(saved)) return saved;
  const browser=(navigator.language||"en").toLowerCase();
  if(browser.startsWith("pt")) return "pt-BR";
  if(browser.startsWith("es")) return "es";
  return "en";
}
function normalizeState(raw){
  const base=EMPTY_STATE();
  if(!raw || typeof raw!=="object") return base;
  return {
    schemaVersion:3,
    meta:{...base.meta,...(raw.meta||{})},
    tasks:raw.tasks && typeof raw.tasks==="object" ? raw.tasks : {},
    evidence:Array.isArray(raw.evidence)?raw.evidence:[],
    entities:Array.isArray(raw.entities)?raw.entities:[],
    relationships:Array.isArray(raw.relationships)?raw.relationships:[],
    timeline:Array.isArray(raw.timeline)?raw.timeline:[],
    findings:Array.isArray(raw.findings)?raw.findings:[],
    logbook:Array.isArray(raw.logbook)?raw.logbook:[],
    uiMode:raw.uiMode==="quick"?"quick":"full"
  };
}
function loadState(){
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved) state=normalizeState(JSON.parse(saved));
  }catch(e){ console.warn("Could not load case state",e); state=EMPTY_STATE(); }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  renderStats();
  updateProgress();
}
function nextId(prefix,arr){
  const max=arr.reduce((m,x)=>{
    const n=parseInt(String(x.id||"").replace(prefix+"-",""),10);
    return Number.isFinite(n)?Math.max(m,n):m;
  },0);
  return prefix+"-"+String(max+1).padStart(3,"0");
}
function parseIds(value,prefix){
  return [...new Set(String(value||"").split(/[;,\s]+/).map(v=>v.trim().toUpperCase()).filter(Boolean).filter(v=>!prefix||v.startsWith(prefix+"-")))];
}
function fmtDate(value){
  if(!value) return tx().noDate;
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return value;
  try{return new Intl.DateTimeFormat(currentLang,{dateStyle:"medium",timeStyle:"short"}).format(d);}catch{return value;}
}
function fillSelect(el,map,selected,includeBlank=false,blankLabel="—"){
  el.innerHTML="";
  if(includeBlank){const o=document.createElement("option");o.value="";o.textContent=blankLabel;el.appendChild(o);}
  for(const [value,label] of Object.entries(map)){
    const o=document.createElement("option");o.value=value;o.textContent=label;el.appendChild(o);
  }
  el.value=selected??"";
}
function taskState(id){
  if(!state.tasks[id]) state.tasks[id]={status:"todo",note:"",source:""};
  return state.tasks[id];
}
function isApplicable(item){
  const p=state.meta.profile||"all";
  return p==="all"||item.tags.includes("all")||item.tags.includes(p);
}
async function loadLocalizedModel(lang){
  if(!baseModel){
    const r=await fetch("data/checklist.json",{cache:"no-store"});
    if(!r.ok) throw new Error("checklist "+r.status);
    baseModel=await r.json();
  }
  if(lang==="pt-BR") return structuredClone(baseModel);
  if(!translationCache[lang]){
    const r=await fetch("data/translations."+lang+".json",{cache:"no-store"});
    if(!r.ok) throw new Error("translation "+r.status);
    translationCache[lang]=await r.json();
  }
  const local=structuredClone(baseModel);
  const overlay=translationCache[lang];
  for(const phase of local.phases){
    const p=overlay.phases?.[phase.id];
    if(!p) continue;
    phase.title=p.title||phase.title; phase.description=p.description||phase.description;
    for(const item of phase.items){
      const i=p.items?.[item.id];
      if(i){item.title=i.title||item.title;item.description=i.description||item.description;}
    }
  }
  return local;
}

function setText(){
  const x=tx();
  document.documentElement.lang=currentLang;
  document.querySelector('meta[name="description"]').content=x.subtitle;
  $("languageSelect").value=currentLang;$("languageLabel").textContent=x.language;$("privacyPill").title=x.privacyTitle;
  $("subtitle").textContent=x.subtitle;$("caseKicker").textContent=x.caseKicker;$("caseHeading").textContent=x.case;$("resetBtn").textContent=x.reset;
  $("caseRefLabel").textContent=x.caseRef;$("profileLabel").textContent=x.profile;$("objectiveLabel").textContent=x.objective;$("objective").placeholder=x.objectivePh;
  $("scopeLabel").textContent=x.scope;$("scope").placeholder=x.scopePh;$("urgencyLabel").textContent=x.urgency;$("analystLabel").textContent=x.analyst;$("analyst").placeholder=x.analystPh;
  $("contextLabel").textContent=x.context;$("context").placeholder=x.contextPh;$("privacyNotice").innerHTML=x.privacyNotice;
  $("progressKicker").textContent=x.progressKicker;$("progressHeading").textContent=x.progress;$("caseBundleKicker").textContent=x.bundleKicker;$("exportHeading").textContent=x.export;
  $("exportBundleBtn").textContent=x.exportBundle;$("importBundleBtn").textContent=x.importBundle;$("exportMdBtn").textContent=x.exportMd;$("printBtn").textContent=x.print;$("insightsBtn").textContent=x.insights;$("exportHint").textContent=x.exportHint;
  $("tabChecklist").textContent=x.tabs.checklist;$("tabEvidence").textContent=x.tabs.evidence;$("tabEntities").textContent=x.tabs.entities;$("tabTimeline").textContent=x.tabs.timeline;$("tabFindings").textContent=x.tabs.findings;$("tabLogbook").textContent=x.tabs.logbook;
  $("checklistHeading").textContent=x.checklist;$("search").placeholder=x.searchPh;$("legendCore").textContent=x.legendCore;$("legendContext").textContent=x.legendContext;$("legendCaveat").textContent=x.legendCaveat;
  $("evidenceHeading").textContent=x.evidenceHeading;$("evidenceIntro").textContent=x.evidenceIntro;$("toggleEvidenceFormBtn").textContent=x.evidenceButton;
  $("evidenceTitleLabel").textContent=x.title;$("evidenceTypeLabel").textContent=x.sourceType;$("evidenceObservedLabel").textContent=x.observedAt;$("evidenceSourceLabel").textContent=x.sourceRef;
  $("evidenceReliabilityLabel").textContent=x.reliability;$("evidenceCredibilityLabel").textContent=x.credibility;$("evidenceTaskLabel").textContent=x.checklistTask;$("evidenceHashLabel").textContent=x.hash;$("evidenceNotesLabel").textContent=x.notes;
  $("saveEvidenceBtn").textContent=x.saveEvidence;$("cancelEvidenceBtn").textContent=x.cancel;$("sourceScaleHelp").textContent=x.sourceScale;$("evidenceSearch").placeholder=x.evidenceSearchPh;
  $("entitiesHeading").textContent=x.entitiesHeading;$("entitiesIntro").textContent=x.entitiesIntro;$("entityRegisterHeading").textContent=x.entityRegister;$("toggleEntityFormBtn").textContent=x.entityButton;
  $("entityLabelLabel").textContent=x.entityLabel;$("entityTypeLabel").textContent=x.entityType;$("entityAliasesLabel").textContent=x.aliases;$("entityNotesLabel").textContent=x.notes;$("saveEntityBtn").textContent=x.saveEntity;$("cancelEntityBtn").textContent=x.cancel;
  $("relationshipHeading").textContent=x.relationships;$("toggleRelationshipFormBtn").textContent=x.relationshipButton;$("relationshipFromLabel").textContent=x.from;$("relationshipTypeLabel").textContent=x.relationType;$("relationshipToLabel").textContent=x.to;
  $("relationshipConfidenceLabel").textContent=x.confidence;$("relationshipEvidenceLabel").textContent=x.evidenceIds;$("relationshipNotesLabel").textContent=x.notes;$("saveRelationshipBtn").textContent=x.saveRelationship;$("cancelRelationshipBtn").textContent=x.cancel;
  $("timelineHeading").textContent=x.timelineHeading;$("timelineIntro").textContent=x.timelineIntro;$("toggleTimelineFormBtn").textContent=x.eventButton;$("timelineWhenLabel").textContent=x.dateTime;$("timelineConfidenceLabel").textContent=x.confidence;
  $("timelineTitleLabel").textContent=x.eventTitle;$("timelineEntityLabel").textContent=x.entityIds;$("timelineEvidenceLabel").textContent=x.evidenceIds;$("timelineDescriptionLabel").textContent=x.description;$("saveTimelineBtn").textContent=x.saveEvent;$("cancelTimelineBtn").textContent=x.cancel;
  $("findingsHeading").textContent=x.findingsHeading;$("findingsIntro").textContent=x.findingsIntro;$("toggleFindingFormBtn").textContent=x.findingButton;$("findingTypeLabel").textContent=x.findingType;$("findingConfidenceLabel").textContent=x.confidence;
  $("findingStatementLabel").textContent=x.statement;$("findingEvidenceLabel").textContent=x.evidenceIds;$("findingEntityLabel").textContent=x.entityIds;$("findingAlternativeLabel").textContent=x.alternative;$("findingCaveatLabel").textContent=x.caveat;$("saveFindingBtn").textContent=x.saveFinding;$("cancelFindingBtn").textContent=x.cancel;
  $("logbookHeading").textContent=x.logbookHeading;$("logbookIntro").textContent=x.logbookIntro;$("logbookNoteLabel").textContent=x.logbookNote;$("logbookNote").placeholder=x.logbookNotePh;$("addLogbookNoteBtn").textContent=x.addLogbookNote;$("exportLogbookBtn").textContent=x.exportLogbook;
  $("insightsHeading").textContent=x.insightsHeading;$("closeInsightsBtn").textContent=x.close;$("footerCaveat").textContent=x.footer;

  fillSelect($("profile"),x.profiles,state.meta.profile);fillSelect($("urgency"),x.urgencies,state.meta.urgency);fillSelect($("statusFilter"),x.status,$("statusFilter").value||"all");
  fillSelect($("evidenceType"),x.sourceTypes,$("evidenceType").value||"web");fillSelect($("evidenceReliability"),x.reliabilities,$("evidenceReliability").value||"NA");fillSelect($("evidenceCredibility"),x.credibilities,$("evidenceCredibility").value||"NA");
  fillSelect($("entityType"),x.entityTypes,$("entityType").value||"person");fillSelect($("relationshipConfidence"),x.confidences,$("relationshipConfidence").value||"na");fillSelect($("timelineConfidence"),x.confidences,$("timelineConfidence").value||"na");
  fillSelect($("findingType"),x.findingTypes,$("findingType").value||"observation");fillSelect($("findingConfidence"),x.confidences,$("findingConfidence").value||"na");
}
function syncMeta(){
  for(const k of ["caseRef","profile","objective","scope","urgency","analyst","context"]) $(k).value=state.meta[k]||"";
}
function bindMeta(){
  for(const k of ["caseRef","profile","objective","scope","urgency","analyst","context"]){
    const h=()=>{state.meta[k]=$(k).value;saveState();if(k==="profile"){renderChecklist();populateTaskSelect();}};
    $(k).addEventListener("input",h);$(k).addEventListener("change",h);
  }
}
function switchTab(name){
  if(state.uiMode==="quick" && !["checklist","logbook"].includes(name)) name="checklist";
  activeTab=name;
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===name));
}
function applyMode(){
  const quick=state.uiMode==="quick";
  document.body.dataset.mode=quick?"quick":"full";
  $("modeQuickBtn").classList.toggle("active",quick);
  $("modeFullBtn").classList.toggle("active",!quick);
  $("modeQuickBtn").textContent=tx().modes.quick;
  $("modeFullBtn").textContent=tx().modes.full;
  $("modeHint").textContent=quick?tx().modeHintQuick:tx().modeHintFull;
  for(const id of ["tabEvidence","tabEntities","tabTimeline","tabFindings"]) $(id).hidden=quick;
  if(quick && !["checklist","logbook"].includes(activeTab)) switchTab("checklist");
}
function setMode(mode){
  state.uiMode=mode==="quick"?"quick":"full";
  saveState();
  applyMode();
  renderChecklist();
}
function appendLog(type,label,ref="",detail=""){
  const id=nextId("LG",state.logbook);
  state.logbook.push({id,at:new Date().toISOString(),type,label,ref,detail});
}
function updateTaskStatus(item,newStatus){
  const s=taskState(item.id);
  const previous=s.status;
  if(previous===newStatus) return;
  s.status=newStatus;
  appendLog("task",item.title,item.id,previous+" → "+newStatus);
  saveState();
  renderLogbook();
}
function renderStats(){
  if(!model) return;
  const items=model.phases.flatMap(p=>p.items).filter(isApplicable);
  const counted=items.filter(i=>taskState(i.id).status!=="na");
  const done=counted.filter(i=>taskState(i.id).status==="done").length;
  const pct=counted.length?Math.round(done/counted.length*100):0;
  const x=tx();
  const stats=[
    [x.stats.checklist,pct+"%"],
    [x.stats.evidence,state.evidence.length],
    [x.stats.entities,state.entities.length],
    [x.stats.timeline,state.timeline.length],
    [x.stats.findings,state.findings.length],
    [x.tabs.logbook,state.logbook.length]
  ];
  $("caseStats").innerHTML=stats.map(([l,v])=>`<div class="stat-card"><strong>${escapeHtml(v)}</strong><span>${escapeHtml(l)}</span></div>`).join("");
}
function updateProgress(){
  if(!model)return;
  const items=model.phases.flatMap(p=>p.items).filter(isApplicable);
  const counted=items.filter(i=>taskState(i.id).status!=="na");const done=counted.filter(i=>taskState(i.id).status==="done");
  const pct=counted.length?Math.round(done.length/counted.length*100):0;
  $("overallBar").style.width=pct+"%";$("overallPct").textContent=pct+"%";$("overallCount").textContent=done.length+" / "+counted.length+" "+tx().applicable;
  $("phaseProgress").innerHTML=model.phases.map(p=>{
    const a=p.items.filter(isApplicable);if(!a.length)return "";
    const c=a.filter(i=>taskState(i.id).status!=="na");const d=c.filter(i=>taskState(i.id).status==="done").length;
    return `<div class="phase-row"><span>${escapeHtml(p.title.replace(/^\d+\s*·\s*/,""))}</span><span>${d}/${c.length}</span></div>`;
  }).join("");
}
function renderChecklist(){
  const root=$("checklist");root.innerHTML="";let visible=0;let lastStage=null;const x=tx();const q=$("search").value.trim().toLowerCase();const sf=$("statusFilter").value;
  for(const phase of model.phases){
    const applicable=phase.items.filter(isApplicable);
    const rows=applicable.filter(item=>{
      const s=taskState(item.id);
      const hay=[item.id,item.title,item.description,...item.tags].join(" ").toLowerCase();
      return (!q||hay.includes(q))&&(sf==="all"||s.status===sf);
    });
    if(!rows.length)continue;visible+=rows.length;
    if(phase.stage && phase.stage!==lastStage){
      const divider=document.createElement("div");
      divider.className="stage-divider";
      divider.innerHTML=`<span>${escapeHtml(x.stages[phase.stage]||phase.stage)}</span>`;
      root.appendChild(divider);
      lastStage=phase.stage;
    }
    const sec=document.createElement("section");sec.className="phase";
    const d=applicable.filter(i=>taskState(i.id).status==="done").length;const n=applicable.filter(i=>taskState(i.id).status!=="na").length;
    sec.innerHTML=`<div class="phase-header"><div><h3>${escapeHtml(phase.title)}</h3><div class="small muted">${escapeHtml(phase.description)}</div></div><div class="phase-meta">${d} / ${n} ${escapeHtml(x.completed)}</div></div>`;
    const list=document.createElement("div");list.className="task-list";
    for(const item of rows){
      const s=taskState(item.id);const row=document.createElement("article");row.className="task"+(s.status==="done"?" task-done":"");
      const check=document.createElement("input");check.type="checkbox";check.className="task-check";check.checked=s.status==="done";check.setAttribute("aria-label",x.markDone+": "+item.title);
      check.onchange=()=>{updateTaskStatus(item,check.checked?"done":"todo");renderChecklist();};
      const body=document.createElement("div");body.innerHTML=`<div class="task-id">${escapeHtml(item.id)}</div><div class="task-title">${escapeHtml(item.title)}</div><div class="task-desc">${escapeHtml(item.description)}</div><div class="badges"><span class="badge ${item.core?"core":""}">${item.core?x.core:x.contextual}</span></div>`;
      const status=document.createElement("select");status.className="task-status";
      for(const k of ["todo","doing","done","na"]){const o=document.createElement("option");o.value=k;o.textContent=x.status[k];status.appendChild(o);}status.value=s.status;
      status.onchange=()=>{updateTaskStatus(item,status.value);renderChecklist();};
      const details=document.createElement("div");details.className="task-details";
      const nl=document.createElement("label");nl.textContent=x.note;const note=document.createElement("textarea");note.rows=2;note.placeholder=x.notePh;note.value=s.note||"";note.oninput=()=>{s.note=note.value;saveState();};nl.appendChild(note);
      const sl=document.createElement("label");sl.textContent=x.source;const src=document.createElement("input");src.placeholder=x.sourcePh;src.value=s.source||"";src.oninput=()=>{s.source=src.value;saveState();};sl.appendChild(src);
      const actions=document.createElement("div");actions.className="task-inline-actions";const ev=document.createElement("button");ev.type="button";ev.className="secondary small-btn";ev.textContent=x.addEvidence;ev.onclick=()=>openEvidenceForTask(item.id,item.title);actions.appendChild(ev);
      details.append(nl,sl,actions);row.append(check,body,status,details);list.appendChild(row);
    }
    sec.appendChild(list);root.appendChild(sec);
  }
  if(!visible) root.innerHTML=`<div class="empty">${escapeHtml(x.emptyFilter)}</div>`;
  updateProgress();renderStats();
}
function populateTaskSelect(selected=""){
  const el=$("evidenceTaskId");el.innerHTML=`<option value="">${escapeHtml(tx().noTask)}</option>`;
  for(const p of model.phases)for(const i of p.items){
    if(!isApplicable(i))continue;
    const o=document.createElement("option");o.value=i.id;o.textContent=i.id+" · "+i.title;el.appendChild(o);
  }
  el.value=selected;
}
function populateEntitySelects(){
  for(const id of ["relationshipFrom","relationshipTo"]){
    const el=$(id);const selected=el.value;el.innerHTML=`<option value="">—</option>`;
    for(const e of state.entities){const o=document.createElement("option");o.value=e.id;o.textContent=e.id+" · "+e.label;el.appendChild(o);}el.value=selected;
  }
}
function renderEvidence(){
  const x=tx();const q=$("evidenceSearch").value.trim().toLowerCase();
  const arr=state.evidence.filter(e=>!q||[e.id,e.title,e.sourceRef,e.notes,e.taskId].join(" ").toLowerCase().includes(q));
  $("evidenceCount").textContent=arr.length+" / "+state.evidence.length;
  $("evidenceList").innerHTML=arr.length?arr.map(e=>`
    <article class="record-card">
      <div class="record-head"><div><span class="record-id">${escapeHtml(e.id)}</span><h3>${escapeHtml(e.title)}</h3></div><div class="record-actions"><button class="ghost" data-edit-evidence="${e.id}">${x.edit}</button><button class="ghost danger" data-delete-evidence="${e.id}">${x.remove}</button></div></div>
      <div class="record-meta">
        <span>${escapeHtml(x.sourceTypes[e.type]||e.type)}</span><span>${escapeHtml(fmtDate(e.observedAt))}</span>
        <span>${escapeHtml(e.reliability||"NA")} / ${escapeHtml(e.credibility||"NA")}</span>
        ${e.taskId?`<span>${escapeHtml(e.taskId)}</span>`:""}
      </div>
      <p class="record-source">${escapeHtml(e.sourceRef||x.noSource)}</p>
      ${e.hash?`<p class="mono small">${escapeHtml(e.hash)}</p>`:""}
      ${e.notes?`<p>${escapeHtml(e.notes)}</p>`:""}
    </article>`).join(""):`<div class="empty">${escapeHtml(x.evidenceEmpty)}</div>`;
}
function renderLogbook(){
  const x=tx();
  const sorted=[...state.logbook].sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  $("logbookList").innerHTML=sorted.length?sorted.map(entry=>`
    <article class="timeline-event">
      <div class="timeline-marker"></div>
      <div class="timeline-card log-entry">
        <div class="record-head"><div><span class="record-id">${escapeHtml(entry.id)}</span><h3>${escapeHtml(x.logActions[entry.type]||entry.type)} · ${escapeHtml(entry.label||"")}</h3></div><span class="small muted">${escapeHtml(fmtDate(entry.at))}</span></div>
        ${entry.ref?`<div class="record-meta"><span>${escapeHtml(entry.ref)}</span></div>`:""}
        ${entry.detail?`<p>${escapeHtml(entry.detail)}</p>`:""}
      </div>
    </article>`).join(""):`<div class="empty">${escapeHtml(x.logbookEmpty)}</div>`;
}
function addLogbookNote(ev){
  ev.preventDefault();
  const note=$("logbookNote").value.trim();
  if(!note) return;
  appendLog("note",tx().logbookNote,"",note);
  $("logbookNote").value="";
  saveState();renderLogbook();
}
function exportLogbook(){
  const lines=["# "+tx().logbookHeading,"",state.meta.caseRef?("**"+tx().caseRef+":** "+state.meta.caseRef):"", ""];
  for(const e of [...state.logbook].sort((a,b)=>String(a.at).localeCompare(String(b.at)))){
    lines.push("- **"+fmtDate(e.at)+"** · "+(tx().logActions[e.type]||e.type)+(e.ref?" · "+e.ref:"")+" · "+e.label+(e.detail?" — "+e.detail:""));
  }
  download(safeName(state.meta.caseRef)+"-logbook-"+currentLang+".md",lines.filter(Boolean).join("\n"),"text/markdown;charset=utf-8");
}

function resetEvidenceForm(){
  $("evidenceForm").reset();$("evidenceEditId").value="";fillSelect($("evidenceType"),tx().sourceTypes,"web");fillSelect($("evidenceReliability"),tx().reliabilities,"NA");fillSelect($("evidenceCredibility"),tx().credibilities,"NA");populateTaskSelect("");
}
function editEvidence(id){
  const e=state.evidence.find(x=>x.id===id);if(!e)return;switchTab("evidence");$("evidenceForm").classList.remove("hidden");
  $("evidenceEditId").value=e.id;$("evidenceTitle").value=e.title||"";$("evidenceType").value=e.type||"web";$("evidenceObservedAt").value=e.observedAt||"";$("evidenceSourceRef").value=e.sourceRef||"";
  $("evidenceReliability").value=e.reliability||"NA";$("evidenceCredibility").value=e.credibility||"NA";populateTaskSelect(e.taskId||"");$("evidenceHash").value=e.hash||"";$("evidenceNotes").value=e.notes||"";
}
function saveEvidenceForm(ev){
  ev.preventDefault();const id=$("evidenceEditId").value||nextId("EV",state.evidence);
  const rec={id,title:$("evidenceTitle").value.trim(),type:$("evidenceType").value,observedAt:$("evidenceObservedAt").value,sourceRef:$("evidenceSourceRef").value.trim(),reliability:$("evidenceReliability").value,credibility:$("evidenceCredibility").value,taskId:$("evidenceTaskId").value,hash:$("evidenceHash").value.trim(),notes:$("evidenceNotes").value.trim(),updatedAt:new Date().toISOString()};
  const idx=state.evidence.findIndex(x=>x.id===id);if(idx>=0)state.evidence[idx]=rec;else state.evidence.push(rec);
  appendLog("evidence",rec.title,rec.id,idx>=0?"updated":"created");
  saveState();resetEvidenceForm();$("evidenceForm").classList.add("hidden");renderEvidence();renderFindings();renderTimeline();renderRelationships();
}
function openEvidenceForTask(taskId,title){
  switchTab("evidence");resetEvidenceForm();$("evidenceForm").classList.remove("hidden");$("evidenceTaskId").value=taskId;$("evidenceTitle").value=title;
}
function deleteEvidence(id){
  if(!confirm(tx().confirmDelete))return;state.evidence=state.evidence.filter(e=>e.id!==id);saveState();renderEvidence();renderInsightsSafe();
}

function renderEntities(){
  const x=tx();
  $("entityList").innerHTML=state.entities.length?state.entities.map(e=>`
    <article class="record-card compact-card"><div class="record-head"><div><span class="record-id">${e.id}</span><h3>${escapeHtml(e.label)}</h3></div><div class="record-actions"><button class="ghost" data-edit-entity="${e.id}">${x.edit}</button><button class="ghost danger" data-delete-entity="${e.id}">${x.remove}</button></div></div>
    <div class="record-meta"><span>${escapeHtml(x.entityTypes[e.type]||e.type)}</span>${e.aliases?`<span>${escapeHtml(e.aliases)}</span>`:""}</div>${e.notes?`<p>${escapeHtml(e.notes)}</p>`:""}</article>`).join(""):`<div class="empty">${x.entityEmpty}</div>`;
  populateEntitySelects();renderRelationships();
}
function resetEntityForm(){$("entityForm").reset();$("entityEditId").value="";fillSelect($("entityType"),tx().entityTypes,"person");}
function saveEntityForm(ev){
  ev.preventDefault();const id=$("entityEditId").value||nextId("EN",state.entities);const rec={id,label:$("entityLabel").value.trim(),type:$("entityType").value,aliases:$("entityAliases").value.trim(),notes:$("entityNotes").value.trim()};
  const idx=state.entities.findIndex(x=>x.id===id);if(idx>=0)state.entities[idx]=rec;else state.entities.push(rec);appendLog("entity",rec.label,rec.id,idx>=0?"updated":"created");saveState();resetEntityForm();$("entityForm").classList.add("hidden");renderEntities();renderTimeline();renderFindings();
}
function editEntity(id){const e=state.entities.find(x=>x.id===id);if(!e)return;$("entityForm").classList.remove("hidden");$("entityEditId").value=e.id;$("entityLabel").value=e.label;$("entityType").value=e.type;$("entityAliases").value=e.aliases||"";$("entityNotes").value=e.notes||"";}
function deleteEntity(id){if(!confirm(tx().confirmDelete))return;state.entities=state.entities.filter(e=>e.id!==id);state.relationships=state.relationships.filter(r=>r.from!==id&&r.to!==id);saveState();renderEntities();renderTimeline();renderFindings();}

function renderRelationships(){
  const x=tx();
  const label=id=>state.entities.find(e=>e.id===id)?.label||id;
  $("relationshipList").innerHTML=state.relationships.length?state.relationships.map(r=>`
    <article class="record-card relation-card"><div class="record-head"><div><span class="record-id">${r.id}</span><h3>${escapeHtml(label(r.from))} → ${escapeHtml(label(r.to))}</h3></div><div class="record-actions"><button class="ghost" data-edit-relationship="${r.id}">${x.edit}</button><button class="ghost danger" data-delete-relationship="${r.id}">${x.remove}</button></div></div>
    <p class="relation-type">${escapeHtml(r.type)}</p><div class="record-meta"><span>${escapeHtml(x.confidences[r.confidence]||r.confidence)}</span><span>${escapeHtml((r.evidenceIds||[]).join(", ")||x.noEvidence)}</span></div>${r.notes?`<p>${escapeHtml(r.notes)}</p>`:""}</article>`).join(""):`<div class="empty">${x.relationshipEmpty}</div>`;
}
function resetRelationshipForm(){$("relationshipForm").reset();$("relationshipEditId").value="";fillSelect($("relationshipConfidence"),tx().confidences,"na");populateEntitySelects();}
function saveRelationshipForm(ev){
  ev.preventDefault();if(!$("relationshipFrom").value||!$("relationshipTo").value)return;
  const id=$("relationshipEditId").value||nextId("RL",state.relationships);const rec={id,from:$("relationshipFrom").value,to:$("relationshipTo").value,type:$("relationshipType").value.trim(),confidence:$("relationshipConfidence").value,evidenceIds:parseIds($("relationshipEvidenceIds").value,"EV"),notes:$("relationshipNotes").value.trim()};
  const idx=state.relationships.findIndex(x=>x.id===id);if(idx>=0)state.relationships[idx]=rec;else state.relationships.push(rec);appendLog("relationship",rec.type,rec.id,idx>=0?"updated":"created");saveState();resetRelationshipForm();$("relationshipForm").classList.add("hidden");renderRelationships();
}
function editRelationship(id){const r=state.relationships.find(x=>x.id===id);if(!r)return;$("relationshipForm").classList.remove("hidden");$("relationshipEditId").value=r.id;populateEntitySelects();$("relationshipFrom").value=r.from;$("relationshipTo").value=r.to;$("relationshipType").value=r.type;$("relationshipConfidence").value=r.confidence||"na";$("relationshipEvidenceIds").value=(r.evidenceIds||[]).join(", ");$("relationshipNotes").value=r.notes||"";}
function deleteRelationship(id){if(!confirm(tx().confirmDelete))return;state.relationships=state.relationships.filter(r=>r.id!==id);saveState();renderRelationships();}

function renderTimeline(){
  const x=tx();const sorted=[...state.timeline].sort((a,b)=>String(a.when||"").localeCompare(String(b.when||"")));
  $("timelineList").innerHTML=sorted.length?sorted.map(e=>`
    <article class="timeline-event"><div class="timeline-marker"></div><div class="timeline-card">
      <div class="record-head"><div><span class="record-id">${e.id}</span><h3>${escapeHtml(e.title)}</h3></div><div class="record-actions"><button class="ghost" data-edit-timeline="${e.id}">${x.edit}</button><button class="ghost danger" data-delete-timeline="${e.id}">${x.remove}</button></div></div>
      <div class="record-meta"><span>${escapeHtml(fmtDate(e.when))}</span><span>${escapeHtml(x.confidences[e.confidence]||e.confidence)}</span></div>
      ${e.description?`<p>${escapeHtml(e.description)}</p>`:""}<div class="record-links">${(e.entityIds||[]).map(id=>`<span>${escapeHtml(id)}</span>`).join("")}${(e.evidenceIds||[]).map(id=>`<span>${escapeHtml(id)}</span>`).join("")}</div>
    </div></article>`).join(""):`<div class="empty">${x.timelineEmpty}</div>`;
}
function resetTimelineForm(){$("timelineForm").reset();$("timelineEditId").value="";fillSelect($("timelineConfidence"),tx().confidences,"na");}
function saveTimelineForm(ev){
  ev.preventDefault();const id=$("timelineEditId").value||nextId("TL",state.timeline);const rec={id,when:$("timelineWhen").value,title:$("timelineTitle").value.trim(),confidence:$("timelineConfidence").value,entityIds:parseIds($("timelineEntityIds").value,"EN"),evidenceIds:parseIds($("timelineEvidenceIds").value,"EV"),description:$("timelineDescription").value.trim()};
  const idx=state.timeline.findIndex(x=>x.id===id);if(idx>=0)state.timeline[idx]=rec;else state.timeline.push(rec);appendLog("timeline",rec.title,rec.id,idx>=0?"updated":"created");saveState();resetTimelineForm();$("timelineForm").classList.add("hidden");renderTimeline();
}
function editTimeline(id){const e=state.timeline.find(x=>x.id===id);if(!e)return;$("timelineForm").classList.remove("hidden");$("timelineEditId").value=e.id;$("timelineWhen").value=e.when||"";$("timelineTitle").value=e.title||"";$("timelineConfidence").value=e.confidence||"na";$("timelineEntityIds").value=(e.entityIds||[]).join(", ");$("timelineEvidenceIds").value=(e.evidenceIds||[]).join(", ");$("timelineDescription").value=e.description||"";}
function deleteTimeline(id){if(!confirm(tx().confirmDelete))return;state.timeline=state.timeline.filter(e=>e.id!==id);saveState();renderTimeline();}

function renderFindings(){
  const x=tx();
  $("findingList").innerHTML=state.findings.length?state.findings.map(f=>`
    <article class="record-card finding-card"><div class="record-head"><div><span class="record-id">${f.id}</span><h3>${escapeHtml(x.findingTypes[f.type]||f.type)}</h3></div><div class="record-actions"><button class="ghost" data-edit-finding="${f.id}">${x.edit}</button><button class="ghost danger" data-delete-finding="${f.id}">${x.remove}</button></div></div>
      <p class="finding-statement">${escapeHtml(f.statement)}</p><div class="record-meta"><span>${escapeHtml(x.confidences[f.confidence]||f.confidence)}</span><span>${escapeHtml((f.evidenceIds||[]).join(", ")||x.noEvidence)}</span><span>${escapeHtml((f.entityIds||[]).join(", "))}</span></div>
      ${f.alternative?`<div class="analysis-note"><strong>${escapeHtml(x.alternative)}:</strong> ${escapeHtml(f.alternative)}</div>`:""}
      ${f.caveat?`<div class="analysis-note"><strong>${escapeHtml(x.caveat)}:</strong> ${escapeHtml(f.caveat)}</div>`:""}
    </article>`).join(""):`<div class="empty">${x.findingEmpty}</div>`;
}
function resetFindingForm(){$("findingForm").reset();$("findingEditId").value="";fillSelect($("findingType"),tx().findingTypes,"observation");fillSelect($("findingConfidence"),tx().confidences,"na");}
function saveFindingForm(ev){
  ev.preventDefault();const id=$("findingEditId").value||nextId("FD",state.findings);const rec={id,type:$("findingType").value,confidence:$("findingConfidence").value,statement:$("findingStatement").value.trim(),evidenceIds:parseIds($("findingEvidenceIds").value,"EV"),entityIds:parseIds($("findingEntityIds").value,"EN"),alternative:$("findingAlternative").value.trim(),caveat:$("findingCaveat").value.trim()};
  const idx=state.findings.findIndex(x=>x.id===id);if(idx>=0)state.findings[idx]=rec;else state.findings.push(rec);appendLog("finding",rec.statement.slice(0,100),rec.id,idx>=0?"updated":"created");saveState();resetFindingForm();$("findingForm").classList.add("hidden");renderFindings();
}
function editFinding(id){const f=state.findings.find(x=>x.id===id);if(!f)return;$("findingForm").classList.remove("hidden");$("findingEditId").value=f.id;$("findingType").value=f.type;$("findingConfidence").value=f.confidence||"na";$("findingStatement").value=f.statement||"";$("findingEvidenceIds").value=(f.evidenceIds||[]).join(", ");$("findingEntityIds").value=(f.entityIds||[]).join(", ");$("findingAlternative").value=f.alternative||"";$("findingCaveat").value=f.caveat||"";}
function deleteFinding(id){if(!confirm(tx().confirmDelete))return;state.findings=state.findings.filter(f=>f.id!==id);saveState();renderFindings();}

function brokenReferences(){
  const ev=new Set(state.evidence.map(x=>x.id));const en=new Set(state.entities.map(x=>x.id));const out=[];
  const check=(owner,ids,set)=>{for(const id of ids||[])if(!set.has(id))out.push(owner+" → "+id);};
  for(const r of state.relationships)check(r.id,r.evidenceIds,ev);
  for(const e of state.timeline){check(e.id,e.evidenceIds,ev);check(e.id,e.entityIds,en);}
  for(const f of state.findings){check(f.id,f.evidenceIds,ev);check(f.id,f.entityIds,en);}
  return out;
}
function processInsights(){
  const items=model.phases.flatMap(p=>p.items.map(i=>({...i,phaseTitle:p.title}))).filter(isApplicable);
  return {
    openCore:items.filter(i=>i.core&& !["done","na"].includes(taskState(i.id).status)).map(i=>i.id+" · "+i.title),
    undocumented:items.filter(i=>taskState(i.id).status==="done"&&!taskState(i.id).note.trim()&&!taskState(i.id).source.trim()).map(i=>i.id+" · "+i.title),
    evidenceMissing:state.evidence.filter(e=>!e.sourceRef).map(e=>e.id+" · "+e.title),
    relationsMissing:state.relationships.filter(r=>!(r.evidenceIds||[]).length).map(r=>r.id+" · "+r.type),
    findingsMissing:state.findings.filter(f=>f.type==="judgment"&&!(f.evidenceIds||[]).length).map(f=>f.id+" · "+f.statement),
    highWeak:state.findings.filter(f=>f.type==="judgment"&&f.confidence==="high"&&(f.evidenceIds||[]).length<2).map(f=>f.id+" · "+f.statement),
    broken:brokenReferences()
  };
}
function renderInsights(){
  const p=processInsights(),x=tx().process;
  const block=(title,desc,arr)=>`<div class="insight-block"><h3>${escapeHtml(title)}</h3><p class="small muted">${escapeHtml(desc)}</p>${arr.length?`<ul>${arr.slice(0,20).map(v=>`<li>${escapeHtml(v)}</li>`).join("")}</ul>`:`<p>${escapeHtml(x.none)}</p>`}</div>`;
  $("insightsContent").innerHTML=block(x.openCore,x.openCoreD,p.openCore)+block(x.undocumented,x.undocumentedD,p.undocumented)+block(x.evidenceMissing,x.evidenceMissingD,p.evidenceMissing)+block(x.relationsMissing,x.relationsMissingD,p.relationsMissing)+block(x.findingsMissing,x.findingsMissingD,p.findingsMissing)+block(x.highWeak,x.highWeakD,p.highWeak)+block(x.brokenRefs,x.brokenRefsD,p.broken);
  $("insightsDialog").showModal();
}
function renderInsightsSafe(){ if($("insightsDialog").open)renderInsights(); }

function reportData(){
  const x=tx().report;const applicable=model.phases.flatMap(p=>p.items.map(i=>({...i,phase:p.title}))).filter(isApplicable);const counted=applicable.filter(i=>taskState(i.id).status!=="na");const done=counted.filter(i=>taskState(i.id).status==="done");const open=applicable.filter(i=>i.core&&!["done","na"].includes(taskState(i.id).status));
  return {x,applicable,counted,done,open,pct:counted.length?Math.round(done.length/counted.length*100):0};
}
function buildMarkdown(){
  const {x,open,pct,done,counted}=reportData();const lines=[`# ${x.title}`,"",`**${x.generated}:** ${new Date().toISOString()}`,`**${x.case}:** ${state.meta.caseRef||x.notProvided}`,`**${x.analyst}:** ${state.meta.analyst||x.notProvided}`,`**${x.profile}:** ${tx().profiles[state.meta.profile]}`,`**${x.urgency}:** ${tx().urgencies[state.meta.urgency]}`,"",`## ${x.executive}`,"",state.meta.objective||x.notProvided,"",`- ${x.coverage}: ${done.length}/${counted.length} (${pct}%)`,`- ${x.evidence}: ${state.evidence.length}`,`- ${x.entities}: ${state.entities.length}`,`- ${x.timeline}: ${state.timeline.length}`,`- ${x.findings}: ${state.findings.length}`,"",`## ${x.scope}`,"",state.meta.scope||x.notProvided,"",`## ${x.context}`,"",state.meta.context||x.notProvided,"",`## ${x.findings}`];
  if(!state.findings.length)lines.push("",x.none);else for(const f of state.findings)lines.push("",`### ${f.id} · ${tx().findingTypes[f.type]}`,f.statement,`- ${tx().confidence}: ${tx().confidences[f.confidence]}`,`- ${tx().evidenceIds}: ${(f.evidenceIds||[]).join(", ")||x.none}`,f.alternative?`- ${tx().alternative}: ${f.alternative}`:"",f.caveat?`- ${tx().caveat}: ${f.caveat}`:"");
  lines.push("",`## ${x.evidence}`);
  if(!state.evidence.length)lines.push("",x.none);else for(const e of state.evidence)lines.push("",`### ${e.id} · ${e.title}`,`- ${tx().sourceType}: ${tx().sourceTypes[e.type]}`,`- ${tx().observedAt}: ${fmtDate(e.observedAt)}`,`- ${tx().sourceRef}: ${e.sourceRef||x.notProvided}`,`- ${tx().reliability}: ${e.reliability}`,`- ${tx().credibility}: ${e.credibility}`,e.taskId?`- ${tx().checklistTask}: ${e.taskId}`:"",e.hash?`- ${tx().hash}: ${e.hash}`:"",e.notes||"");
  lines.push("",`## ${x.entities}`);if(!state.entities.length)lines.push("",x.none);else for(const e of state.entities)lines.push(`- **${e.id}** · ${e.label} · ${tx().entityTypes[e.type]}${e.aliases?" · "+e.aliases:""}`);
  lines.push("",`## ${x.relationships}`);if(!state.relationships.length)lines.push("",x.none);else for(const r of state.relationships)lines.push(`- **${r.id}** · ${r.from} —[${r.type}]→ ${r.to} · ${tx().confidences[r.confidence]} · ${(r.evidenceIds||[]).join(", ")||x.none}`);
  lines.push("",`## ${x.timeline}`);if(!state.timeline.length)lines.push("",x.none);else for(const e of [...state.timeline].sort((a,b)=>String(a.when).localeCompare(String(b.when))))lines.push(`- **${fmtDate(e.when)}** · ${e.id} · ${e.title} · ${(e.evidenceIds||[]).join(", ")}`);
  lines.push("",`## ${x.openCore}`);if(!open.length)lines.push("",x.none);else for(const i of open)lines.push(`- [ ] ${i.id} · ${i.title}`);
  lines.push("",`## ${x.method}`,"",x.methodText,"");return lines.filter(v=>v!==undefined).join("\n");
}
function safeName(v){return (v||"case").trim().replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"case";}
function download(name,content,mime){const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);}
function exportBundle(){
  const payload={schema:SCHEMA,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),locale:currentLang,state};
  download(safeName(state.meta.caseRef)+"-osint-case-v2.json",JSON.stringify(payload,null,2),"application/json;charset=utf-8");
}
function exportMarkdown(){download(safeName(state.meta.caseRef)+"-osint-report-"+currentLang+".md",buildMarkdown(),"text/markdown;charset=utf-8");}
async function importBundle(file){
  try{
    const parsed=JSON.parse(await file.text());let incoming;
    if((parsed.schema===SCHEMA||parsed.schema==="osintchecklist.case.v2")&&parsed.state)incoming=parsed.state;
    else if(parsed.schema==="osintchecklist.case.v1"||parsed.meta||parsed.tasks)incoming=parsed.state||parsed;
    else throw new Error("schema");
    if(!confirm(tx().importConfirm))return;
    state=normalizeState(incoming);saveState();syncMeta();renderAll();alert(tx().imported);
  }catch(e){console.error(e);alert(tx().importInvalid);}
}
function printReport(){
  const md=buildMarkdown();const htmlBody=escapeHtml(md).replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/^- \[ \] (.+)$/gm,"<div>☐ $1</div>").replace(/^- (.+)$/gm,"<div>• $1</div>").replace(/\n\n/g,"<br><br>").replace(/\n/g,"<br>");
  const w=window.open("","_blank");if(!w){alert(tx().popupBlocked);return;}
  w.document.write(`<!doctype html><html lang="${currentLang}"><head><meta charset="utf-8"><title>${escapeHtml(tx().report.title)}</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:36px auto;padding:0 24px;line-height:1.5;color:#111}h1{font-size:30px}h2{margin-top:32px;border-bottom:1px solid #bbb;padding-bottom:6px}h3{margin-top:22px}.print{position:fixed;right:20px;top:20px}@media print{.print{display:none}body{margin:0;max-width:none}}</style></head><body><button class="print" onclick="window.print()">${escapeHtml(tx().report.print)}</button>${htmlBody}</body></html>`);w.document.close();
}
function resetCase(){if(!confirm(tx().resetConfirm))return;state=EMPTY_STATE();localStorage.removeItem(STORAGE_KEY);syncMeta();renderAll();}
function renderAll(){setText();syncMeta();populateTaskSelect();populateEntitySelects();renderChecklist();renderEvidence();renderEntities();renderTimeline();renderFindings();renderLogbook();renderStats();updateProgress();applyMode();}
async function setLanguage(lang){if(!I18N[lang])lang="en";currentLang=lang;localStorage.setItem(LANG_KEY,lang);model=await loadLocalizedModel(lang);renderAll();}

function bind(){
  bindMeta();
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
  $("modeQuickBtn").addEventListener("click",()=>setMode("quick"));
  $("modeFullBtn").addEventListener("click",()=>setMode("full"));
  $("languageSelect").addEventListener("change",()=>setLanguage($("languageSelect").value));
  $("search").addEventListener("input",renderChecklist);$("statusFilter").addEventListener("change",renderChecklist);
  $("resetBtn").addEventListener("click",resetCase);$("exportBundleBtn").addEventListener("click",exportBundle);$("importBundleBtn").addEventListener("click",()=>$("importBundleInput").click());
  $("importBundleInput").addEventListener("change",e=>{if(e.target.files?.[0])importBundle(e.target.files[0]);e.target.value="";});
  $("exportMdBtn").addEventListener("click",exportMarkdown);$("printBtn").addEventListener("click",printReport);$("insightsBtn").addEventListener("click",renderInsights);$("closeInsightsBtn").addEventListener("click",()=>$("insightsDialog").close());
  $("logbookNoteForm").addEventListener("submit",addLogbookNote);$("exportLogbookBtn").addEventListener("click",exportLogbook);

  $("toggleEvidenceFormBtn").onclick=()=>{resetEvidenceForm();$("evidenceForm").classList.toggle("hidden");};$("cancelEvidenceBtn").onclick=()=>{$("evidenceForm").classList.add("hidden");resetEvidenceForm();};$("evidenceForm").addEventListener("submit",saveEvidenceForm);$("evidenceSearch").addEventListener("input",renderEvidence);
  $("evidenceList").addEventListener("click",e=>{const a=e.target.closest("[data-edit-evidence]");const d=e.target.closest("[data-delete-evidence]");if(a)editEvidence(a.dataset.editEvidence);if(d)deleteEvidence(d.dataset.deleteEvidence);});

  $("toggleEntityFormBtn").onclick=()=>{resetEntityForm();$("entityForm").classList.toggle("hidden");};$("cancelEntityBtn").onclick=()=>{$("entityForm").classList.add("hidden");resetEntityForm();};$("entityForm").addEventListener("submit",saveEntityForm);
  $("entityList").addEventListener("click",e=>{const a=e.target.closest("[data-edit-entity]");const d=e.target.closest("[data-delete-entity]");if(a)editEntity(a.dataset.editEntity);if(d)deleteEntity(d.dataset.deleteEntity);});

  $("toggleRelationshipFormBtn").onclick=()=>{resetRelationshipForm();$("relationshipForm").classList.toggle("hidden");};$("cancelRelationshipBtn").onclick=()=>{$("relationshipForm").classList.add("hidden");resetRelationshipForm();};$("relationshipForm").addEventListener("submit",saveRelationshipForm);
  $("relationshipList").addEventListener("click",e=>{const a=e.target.closest("[data-edit-relationship]");const d=e.target.closest("[data-delete-relationship]");if(a)editRelationship(a.dataset.editRelationship);if(d)deleteRelationship(d.dataset.deleteRelationship);});

  $("toggleTimelineFormBtn").onclick=()=>{resetTimelineForm();$("timelineForm").classList.toggle("hidden");};$("cancelTimelineBtn").onclick=()=>{$("timelineForm").classList.add("hidden");resetTimelineForm();};$("timelineForm").addEventListener("submit",saveTimelineForm);
  $("timelineList").addEventListener("click",e=>{const a=e.target.closest("[data-edit-timeline]");const d=e.target.closest("[data-delete-timeline]");if(a)editTimeline(a.dataset.editTimeline);if(d)deleteTimeline(d.dataset.deleteTimeline);});

  $("toggleFindingFormBtn").onclick=()=>{resetFindingForm();$("findingForm").classList.toggle("hidden");};$("cancelFindingBtn").onclick=()=>{$("findingForm").classList.add("hidden");resetFindingForm();};$("findingForm").addEventListener("submit",saveFindingForm);
  $("findingList").addEventListener("click",e=>{const a=e.target.closest("[data-edit-finding]");const d=e.target.closest("[data-delete-finding]");if(a)editFinding(a.dataset.editFinding);if(d)deleteFinding(d.dataset.deleteFinding);});
}
async function init(){
  loadState();
  try{model=await loadLocalizedModel(currentLang);}catch(e){console.error(e);$("checklist").innerHTML='<div class="empty">Could not load checklist data.</div>';return;}
  renderAll();bind();
}
document.addEventListener("DOMContentLoaded",init);

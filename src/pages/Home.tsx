import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    Clock3,
    Factory,
    Gauge,
    Layers,
    ShieldCheck,
    Sparkles,
    Timer,
    TrendingUp,
    Users,
    Wrench,
} from "lucide-react";

const stats = [
    {
        title: "Ordens em produção",
        value: "24",
        change: "+12% vs ontem",
        icon: Factory,
        trend: "up" as const,
    },
    {
        title: "Faturamento projetado",
        value: "R$ 482 mil",
        change: "+8% nos próximos 30 dias",
        icon: BarChart3,
        trend: "up" as const,
    },
    {
        title: "OEE médio",
        value: "87%",
        change: "+3% no turno atual",
        icon: Gauge,
        trend: "up" as const,
    },
    {
        title: "Entregas no prazo",
        value: "94%",
        change: "-2% na última semana",
        icon: Clock3,
        trend: "down" as const,
    },
];

const quickActions = [
    { label: "Nova ordem de produção", icon: Sparkles, variant: "default" as const },
    { label: "Agendar manutenção", icon: Wrench, variant: "secondary" as const },
    { label: "Capacidade & lead time", icon: Gauge, variant: "outline" as const },
];

const liveOps = [
    {
        title: "Linha 01 · Montagem fina",
        status: "Operando",
        tone: "ok" as const,
        load: "78% de capacidade",
        detail: "Tempo de ciclo estável nas últimas 2h",
    },
    {
        title: "Linha 02 · Injeção",
        status: "Atenção",
        tone: "alert" as const,
        load: "67% de capacidade",
        detail: "Setup programado em 15 min",
    },
    {
        title: "Linha 03 · Acabamento",
        status: "Pausada",
        tone: "pause" as const,
        load: "Liberando preparação",
        detail: "Troca de ferramenta em progresso",
    },
];

const agenda = [
    {
        title: "Inspeção de qualidade — Lote 2231",
        time: "14:30",
        owner: "Equipe QA",
        status: "Confirmado",
    },
    {
        title: "Expedição — Cliente Atlas",
        time: "15:10",
        owner: "Docas 2",
        status: "Carregando",
    },
    {
        title: "Reunião rápida de piso",
        time: "16:00",
        owner: "Coordenação",
        status: "Checklist",
    },
];

const featuredModules = [
    {
        title: "Planejamento avançado",
        description: "Simule cenários de produção e reaja rápido a variações de demanda.",
        icon: Layers,
    },
    {
        title: "Manutenção inteligente",
        description: "Priorize ativos por MTBF, backlog e impacto em linhas críticas.",
        icon: Wrench,
    },
    {
        title: "Qualidade e conformidade",
        description: "Rastreie lotes, desvios e evidências em tempo real.",
        icon: ShieldCheck,
    },
    {
        title: "Portal do cliente",
        description: "Visibilidade de pedidos, SLA e ocorrências sem depender do time.",
        icon: Users,
    },
];

export function Home() {
    usePageTitle("Dashboard - ERP Industrial");

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                <Card className="relative overflow-hidden border-none bg-linear-to-br from-primary/10 via-background to-background shadow-lg">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 right-4 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

                    <CardHeader className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary">
                            <span className="text-muted-foreground">Atualizado há 3 min</span>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl leading-tight md:text-3xl">
                                Operação conectada e pronta para o próximo lote
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-base leading-relaxed">
                                Uma visão rápida do que importa: capacidade disponível, saúde das
                                linhas e atalhos para agir sem sair do painel inicial.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="relative z-10 flex flex-wrap items-center gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button
                                    key={action.label}
                                    variant={action.variant}
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Icon className="size-4" />
                                    {action.label}
                                    {action.variant === "default" && (
                                        <ArrowUpRight className="size-4" />
                                    )}
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Pulso das linhas</CardTitle>
                                <CardDescription>Visão rápida do chão de fábrica.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon-sm">
                                <Activity className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {liveOps.map((line) => (
                                <div
                                    key={line.title}
                                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">{line.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {line.load} · {line.detail}
                                        </p>
                                    </div>

                                    <span
                                        className={cn(
                                            "rounded-full px-3 py-1 text-xs font-medium",
                                            line.tone === "ok" &&
                                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                                            line.tone === "alert" &&
                                                "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
                                            line.tone === "pause" &&
                                                "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200"
                                        )}
                                    >
                                        {line.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 rounded-lg border px-4 py-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Capacidade média ao vivo</span>
                                <span>82%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                                <div className="h-full w-[82%] rounded-full bg-primary" />
                            </div>
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="size-4 text-primary" />
                                Turno B 4% acima da média das últimas 24h.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isUp = stat.trend === "up";
                    return (
                        <Card key={stat.title} className="border-none shadow-sm">
                            <CardHeader className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{stat.title}</CardTitle>
                                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                                        <Icon className="size-4" />
                                    </span>
                                </div>
                                <CardDescription>{stat.change}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-2xl font-semibold leading-none">
                                    {stat.value}
                                </div>
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                        isUp
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                                    )}
                                >
                                    {isUp ? (
                                        <ArrowUpRight className="size-3.5" />
                                    ) : (
                                        <Timer className="size-3.5" />
                                    )}
                                    {stat.trend === "up" ? "Acelerando" : "Ajustar ritmo"}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                <Card className="border-none shadow-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Agenda do turno</CardTitle>
                                <CardDescription>
                                    Marcos próximos e donos das tarefas.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full">
                                <CheckCircle2 className="size-4" />
                                Confirmar tudo
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {agenda.map((item) => (
                                <div
                                    key={item.title}
                                    className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border px-4 py-3"
                                >
                                    <div className="mt-0.5 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                        {item.time}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.owner}
                                        </p>
                                    </div>
                                    <span className="self-center rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
                                <Sparkles className="size-3.5 text-primary" />
                                Insights de qualidade integrados ao checklist
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
                                <Timer className="size-3.5 text-primary" />
                                Previsão de término do lote atual em 48 min
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Módulos em destaque</CardTitle>
                                <CardDescription>
                                    Continue de onde parou ou explore melhorias rápidas.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="icon-sm">
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {featuredModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <div
                                    key={module.title}
                                    className="flex items-start justify-between rounded-lg border px-4 py-3 transition hover:border-primary/40 hover:bg-accent/30"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                                            <Icon className="size-4" />
                                        </span>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold">{module.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="sm" className="rounded-full">
                                        Abrir
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

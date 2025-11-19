import React, { useEffect, useRef, useState } from "react";
import { Button, Text, Heading } from "@radix-ui/themes";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../schemas/auth/login.schema";

export function Login() {
    const [values, setValues] = useState<LoginFormValues>({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const usernameInputRef = useRef<HTMLInputElement | null>(null);

    const { login, isLoading, errorMessage, reset } = useLogin();

    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
            const f = parsed.error.flatten().fieldErrors;
            setErrors({ username: f.username?.[0], password: f.password?.[0] });
            usernameInputRef.current?.focus();
            return;
        }

        setErrors({});
        reset();
        login(parsed.data);
    };

    useEffect(() => {
        if (errorMessage) {
            usernameInputRef.current?.focus();
        }
    }, [errorMessage]);

    return (
        <div className="login-page min-h-screen bg-slate-950 text-slate-50">
            <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
                <div className="flex w-full max-w-4xl flex-col gap-8 md:flex-row md:items-center md:gap-10">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <span className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[0.7rem] font-medium text-slate-200">
                            Ambiente corporativo • Acesso restrito
                        </span>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                            Acesso ao painel do sistema
                        </h1>

                        <p className="mx-auto max-w-md text-xs text-slate-300 sm:text-sm md:mx-0">
                            Autentique-se para acessar funcionalidades administrativas, relatórios e
                            indicadores de desempenho. Somente usuários autorizados podem
                            prosseguir.
                        </p>
                    </div>

                    <div className="flex-1">
                        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-lg shadow-black/40 sm:p-6">
                            <div className="mb-5 space-y-1 text-center">
                                <Heading as="h2" size="4" className="text-slate-50">
                                    Entrar no sistema
                                </Heading>
                                <Text size="2" className="text-slate-400">
                                    Informe suas credenciais de acesso.
                                </Text>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-[0.7rem] font-medium uppercase tracking-wide text-slate-300">
                                        Usuário
                                    </label>
                                    <input
                                        ref={usernameInputRef}
                                        value={values.username}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues((prev) => ({ ...prev, username: value }));
                                            setErrors((prev) => ({
                                                ...prev,
                                                username: undefined,
                                            }));
                                            if (errorMessage) {
                                                reset();
                                            }
                                        }}
                                        className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-0 transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/60"
                                        autoComplete="username"
                                    />
                                    {errors.username && (
                                        <Text size="2" className="text-red-400">
                                            {errors.username}
                                        </Text>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[0.7rem] font-medium uppercase tracking-wide text-slate-300">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={values.password}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues((prev) => ({ ...prev, password: value }));
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: undefined,
                                            }));
                                            if (errorMessage) {
                                                reset();
                                            }
                                        }}
                                        className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none ring-0 transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/60"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && (
                                        <Text size="2" className="text-red-400">
                                            {errors.password}
                                        </Text>
                                    )}
                                </div>

                                {errorMessage && (
                                    <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    style={{ cursor: "pointer" }}
                                    disabled={isLoading}
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-slate-50 shadow-sm shadow-black/30 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoading && (
                                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-50 border-t-transparent" />
                                    )}
                                    <span className="text-slate-50">
                                        {isLoading ? "Entrando..." : "Entrar"}
                                    </span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

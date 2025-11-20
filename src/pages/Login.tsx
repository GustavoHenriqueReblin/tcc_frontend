import { useEffect, useRef, useState, FormEvent } from "react";
import { loginSchema, type LoginFormValues } from "../schemas/auth/login.schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Login() {
    const [values, setValues] = useState<LoginFormValues>({
        username: "",
        password: "",
    });

    const { login, isLoading, errorMessage, resetLogin } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const usernameInputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
            const f = parsed.error.flatten().fieldErrors;
            setErrors({ username: f.username?.[0], password: f.password?.[0] });
            usernameInputRef.current?.focus();
            return;
        }

        setErrors({});
        resetLogin();
        await login(parsed.data);
        navigate("/", { replace: true });
    };

    useEffect(() => {
        if (errorMessage) {
            usernameInputRef.current?.focus();
        }
    }, [errorMessage]);

    useEffect(() => {
        return resetLogin();
    }, [resetLogin]);

    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-8 sm:px-6">
            <div className="flex w-full max-w-4xl flex-col gap-8 md:flex-row md:items-center md:gap-10">
                <div className="hidden md:block flex-1 space-y-4 text-center md:text-left">
                    <span className="inline-flex items-center justify-center rounded-full border px-3 py-1 text-[0.7rem] font-medium">
                        Ambiente corporativo • Acesso restrito
                    </span>

                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Acesso ao painel do sistema
                    </h1>

                    <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm md:mx-0">
                        Autentique-se para acessar funcionalidades administrativas, relatórios e
                        indicadores de desempenho. Somente usuários autorizados podem prosseguir.
                    </p>
                </div>

                <div className="flex-1">
                    <Card className="mx-auto w-full max-w-md">
                        <CardHeader className="text-center">
                            <h2 className="text-xl font-semibold">Entrar no sistema</h2>
                            <p className="text-sm text-muted-foreground">
                                Informe suas credenciais de acesso.
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="username"
                                        className="text-xs uppercase tracking-wide"
                                    >
                                        Usuário
                                    </Label>
                                    <Input
                                        id="username"
                                        ref={usernameInputRef}
                                        value={values.username}
                                        autoComplete="username"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues((prev) => ({ ...prev, username: value }));
                                            setErrors((prev) => ({ ...prev, username: undefined }));
                                            if (errorMessage) resetLogin();
                                        }}
                                    />
                                    {errors.username && (
                                        <p className="text-red-800 text-xs">{errors.username}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs uppercase tracking-wide"
                                    >
                                        Senha
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={values.password}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues((prev) => ({ ...prev, password: value }));
                                            setErrors((prev) => ({ ...prev, password: undefined }));
                                            if (errorMessage) resetLogin();
                                        }}
                                    />
                                    {errors.password && (
                                        <p className="text-red-800 text-xs">{errors.password}</p>
                                    )}
                                </div>

                                {errorMessage && (
                                    <div className="rounded-md border border-red-800/50 bg-red-500/10 px-3 py-2 text-xs text-red-800">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                                    {isLoading && (
                                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    )}
                                    {isLoading ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

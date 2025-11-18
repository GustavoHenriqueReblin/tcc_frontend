import type React from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Box, Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useLocation, useNavigate } from "react-router-dom";
import { api, type ApiResponse } from "../api/client";
import { useAuth, type User } from "../context/AuthContext";

const loginSchema = z.object({
    username: z.string().min(1, "Usuário é obrigatório"),
    password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

type LoginResponse = ApiResponse<unknown>;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    const [values, setValues] = useState<LoginFormValues>({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    const state = location.state as { from?: { pathname?: string } } | null;
    const from = state?.from?.pathname ?? "/";

    const loginMutation = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            await api.post<LoginResponse>("/auth/login", data);

            const response = await api.get<ApiResponse<User>>("/auth/me");
            return response.data;
        },
        onSuccess: (result) => {
            if (result.success && result.data) {
                setUser(result.data);
                navigate(from, { replace: true });
            } else {
                setFormError("Usuário ou senha inválidos.");
            }
        },
        onError: () => {
            setFormError("Usuário ou senha inválidos.");
        },
    });

    const handleChange =
        (field: keyof LoginFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
            setFormError(null);
        };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const result = loginSchema.safeParse(values);

        if (!result.success) {
            const fieldErrors: FieldErrors = {};

            for (const issue of result.error.issues) {
                const field = issue.path[0];
                if (typeof field === "string") {
                    fieldErrors[field as keyof LoginFormValues] = issue.message;
                }
            }

            setErrors(fieldErrors);
            return;
        }

        loginMutation.mutate(result.data);
    };

    return (
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
            <Box style={{ width: "100%", maxWidth: 400, padding: 16 }}>
                <Card size="3">
                    <form onSubmit={handleSubmit}>
                        <Flex direction="column" gap="4">
                            <Heading size="5" align="center">
                                Login
                            </Heading>

                            <Box>
                                <Text as="label" size="2">
                                    Usuário
                                </Text>
                                <TextField.Root
                                    value={values.username}
                                    onChange={handleChange("username")}
                                    placeholder="Digite seu usuário"
                                    type="text"
                                />
                                {errors.username && (
                                    <Text color="red" size="1">
                                        {errors.username}
                                    </Text>
                                )}
                            </Box>

                            <Box>
                                <Text as="label" size="2">
                                    Senha
                                </Text>
                                <TextField.Root
                                    value={values.password}
                                    onChange={handleChange("password")}
                                    placeholder="Digite sua senha"
                                    type="password"
                                />
                                {errors.password && (
                                    <Text color="red" size="1">
                                        {errors.password}
                                    </Text>
                                )}
                            </Box>

                            {formError && (
                                <Text color="red" size="1">
                                    {formError}
                                </Text>
                            )}

                            <Button type="submit" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? "Entrando..." : "Entrar"}
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </Box>
        </Flex>
    );
};

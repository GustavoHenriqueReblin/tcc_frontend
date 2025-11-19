import React, { useState } from "react";
import { TextField, Button, Box, Text, Flex, Heading, Card } from "@radix-ui/themes";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../schemas/auth/login.schema";

export function Login() {
    const [values, setValues] = useState<LoginFormValues>({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const { login, isLoading, error } = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
            const f = parsed.error.flatten().fieldErrors;
            setErrors({ username: f.username?.[0], password: f.password?.[0] });
            return;
        }

        setErrors({});
        login(parsed.data);
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
                                <Text>Usuário</Text>
                                <TextField.Root
                                    value={values.username}
                                    onChange={(e) =>
                                        setValues({ ...values, username: e.target.value })
                                    }
                                />
                                {errors.username && <Text color="red">{errors.username}</Text>}
                            </Box>

                            <Box>
                                <Text>Senha</Text>
                                <TextField.Root
                                    type="password"
                                    value={values.password}
                                    onChange={(e) =>
                                        setValues({ ...values, password: e.target.value })
                                    }
                                />
                                {errors.password && <Text color="red">{errors.password}</Text>}
                            </Box>

                            {error && <Text color="red">{error.message}</Text>}

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </Box>
        </Flex>
    );
}

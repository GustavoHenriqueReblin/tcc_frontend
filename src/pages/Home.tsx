import type React from "react";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <Flex direction="column" gap="3" style={{ padding: 24 }}>
            <Heading size="6">Home</Heading>
            <Box>
                <Text size="3">Bem-vindo{user?.username ? `, ${user.username}` : ""}!</Text>
            </Box>
        </Flex>
    );
};

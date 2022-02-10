import { HttpResponse } from "types/http";
import { User } from "types/model";
import type { NextPage } from "next";
import axios from "axios";
import { useQuery } from "react-query";
import { Box, Container, Heading, Text } from "@chakra-ui/layout";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Head from "next/head";
import { Button } from "@chakra-ui/button";

const fetchUsers = async () => {
  return axios.get<HttpResponse<User[]>>("/api/users").then((res) => res.data);
};

const Home: NextPage = () => {
  const usersQuery = useQuery("users", fetchUsers, { retry: false });

  const refetchHandler = () => usersQuery.refetch();

  return (
    <Container maxWidth="container.lg" py="10">
      <Head>
        <title>Next Users</title>
      </Head>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="xl">
          Next-mirage
        </Heading>
        <Button
          colorScheme="blue"
          onClick={refetchHandler}
          disabled={usersQuery.isFetching}
        >
          Refetch
        </Button>
      </Box>
      <Box mt="2" mb="4">
        {usersQuery.isFetching ? (
          <Text color="gray.200">Fetch users...</Text>
        ) : (
          <>
            {usersQuery.isSuccess ? (
              <Text color="green.400">Fetch users success!</Text>
            ) : (
              <Text color="red.400">Fetch users failed!</Text>
            )}
          </>
        )}
      </Box>
      {usersQuery.isSuccess && !usersQuery.isFetching ? (
        <>
          {usersQuery.data.data?.length ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Id</Th>
                  <Th>Full Name</Th>
                  <Th>Email</Th>
                </Tr>
              </Thead>
              <Tbody>
                {usersQuery.data.data?.map((user) => {
                  return (
                    <Tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>{user.fullName}</Td>
                      <Td>{user.email}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <Text fontWeight="bold" align="center">
              Users not found
            </Text>
          )}
        </>
      ) : null}
    </Container>
  );
};

export default Home;

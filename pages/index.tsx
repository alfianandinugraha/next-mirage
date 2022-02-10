import { HttpResponse } from "types/http";
import { User } from "types/model";
import type { NextPage } from "next";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/layout";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Head from "next/head";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@chakra-ui/toast";
import { CircularProgress } from "@chakra-ui/progress";
import { useMemo } from "react";

const fetchUsers = async () => {
  return axios.get<HttpResponse<User[]>>("/api/users").then((res) => res.data);
};

const storeUser = async (fullName: string, email: string) => {
  return axios
    .post<HttpResponse>("/api/users", { fullName, email })
    .then((res) => res.data);
};

const Home: NextPage = () => {
  const { register, handleSubmit, getValues, reset } = useForm({
    defaultValues: {
      email: "",
      fullName: "",
    },
  });
  const toast = useToast({
    duration: 2000,
    variant: "solid",
    position: "bottom-right",
  });
  const usersQuery = useQuery("users", fetchUsers, { retry: false });
  const storeUserQuery = useMutation<HttpResponse, any, Omit<User, "id">>(
    (data) => {
      return storeUser(data.fullName, data.email);
    }
  );

  const refetchHandler = () => usersQuery.refetch();

  const canUseForm = useMemo(
    () => storeUserQuery.isLoading || usersQuery.isFetching,
    [storeUserQuery.isLoading, usersQuery.isFetching]
  );

  const formSubmitHandler = () => {
    storeUserQuery
      .mutateAsync({
        email: getValues("email"),
        fullName: getValues("fullName"),
      })
      .then((data) => {
        toast({
          description: data.message,
          title: "Success",
          status: "success",
        });
        reset();
        usersQuery.refetch();
      })
      .catch((err) => {
        toast({
          description: err?.response?.data?.message ?? "Something wrong",
          title: "Failed",
          status: "error",
        });
      });
  };

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
      <HStack
        spacing="4"
        mb="4"
        as="form"
        onSubmit={handleSubmit(formSubmitHandler)}
      >
        <Input
          id="name"
          type="name"
          placeholder="Full Name"
          disabled={canUseForm}
          {...register("fullName")}
        />
        <Input
          id="email"
          placeholder="Email"
          disabled={canUseForm}
          {...register("email")}
        />
        <Button
          colorScheme="blue"
          width="full"
          type="submit"
          disabled={canUseForm}
        >
          Send
        </Button>
      </HStack>
      {usersQuery.isFetching ? (
        <Center mt="8">
          <CircularProgress isIndeterminate color="blue.600" />
        </Center>
      ) : null}
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

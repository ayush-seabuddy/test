import CompanyContentList from '@/src/screens/CompanyContentList/ContentList';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const CompanyContentListScreen = () => {

  const { title,contentType }:{title:string,contentType:string} = useLocalSearchParams();

  return (
    <CompanyContentList headerTitle={title} contentType={contentType}/>
  )
}

export default CompanyContentListScreen
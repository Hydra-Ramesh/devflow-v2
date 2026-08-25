import { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import FilterBar from '../components/home/FilterBar';
import QuestionFeed from '../components/home/QuestionFeed';
import MixedFeed from '../components/home/MixedFeed';
import { useQuestions, useMixedFeed } from '../services/queries';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('foryou');
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const questionsQuery = useQuestions(debouncedSearch, filter);
  const mixedFeedQuery = useMixedFeed();
  
  const isForYou = filter === 'foryou';

  const questions = questionsQuery.data?.pages.flatMap((page) => page.questions) || [];
  const mixedItems = mixedFeedQuery.data?.pages.flatMap((page) => page.feed) || [];

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <HeroSection />
        <FilterBar 
          searchInput={searchInput} 
          setSearchInput={setSearchInput} 
          filter={filter} 
          setFilter={setFilter} 
        />
        
        {isForYou ? (
          <MixedFeed 
            status={mixedFeedQuery.status} 
            error={mixedFeedQuery.error} 
            items={mixedItems} 
            hasNextPage={mixedFeedQuery.hasNextPage} 
            fetchNextPage={mixedFeedQuery.fetchNextPage} 
            isFetchingNextPage={mixedFeedQuery.isFetchingNextPage} 
            isFetching={mixedFeedQuery.isFetching} 
            onArticleClick={(article) => navigate(`/articles?id=${article.id || article._id}`)}
          />
        ) : (
          <QuestionFeed 
            status={questionsQuery.status} 
            error={questionsQuery.error} 
            questions={questions} 
            hasNextPage={questionsQuery.hasNextPage} 
            fetchNextPage={questionsQuery.fetchNextPage} 
            isFetchingNextPage={questionsQuery.isFetchingNextPage} 
            isFetching={questionsQuery.isFetching} 
          />
        )}
      </div>
    </div>
  );
}
